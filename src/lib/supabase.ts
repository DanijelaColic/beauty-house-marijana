// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { 
  Service, 
  Booking, 
  BusinessHours, 
  TimeOff,
  BookingStatus,
  StaffProfile
} from '../types';

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 SUPABASE KONFIGURACIJA:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'NEDOSTAJE',
  key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NEDOSTAJE',
  urlFull: supabaseUrl,
  keyFull: supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEDOSTAJU SUPABASE ENVIRONMENT VARIJABLE:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
  throw new Error('Missing Supabase environment variables. Please check your Vercel environment configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "public" },  
});

// Database service interface
export class SupabaseService {
  private client = supabase;
  
  // Get service role client for admin operations (bypasses RLS)
  private getServiceRoleClient() {
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey || !supabaseUrl) {
      return null;
    }
    return createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'public' },
    });
  }

  // === SERVICES ===
  async getServices(): Promise<Service[]> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('active', true);
    
    if (error) throw error;
    return (data || []).map(this.formatService);
  }

  async getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  }

  // === BOOKINGS ===
  async createBooking(
    bookingData: {
      serviceId: string;
      clientName: string;
      clientEmail: string;
      clientPhone?: string;
      startAt: string; // ISO datetime
      notes?: string;
      staffId?: string; // Optional: staff_profile id
    },
    authenticatedClient?: any
  ): Promise<Booking> {
    // Use authenticated client if provided (for staff/admin), otherwise use default client
    const client = authenticatedClient || this.client;

    // Get service to calculate end time
    const service = await this.getServiceById(bookingData.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const startAt = new Date(bookingData.startAt);
    const endAt = new Date(startAt.getTime() + service.duration * 60000); // duration is in minutes

    const insertData: any = {
      service_id: bookingData.serviceId,
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail.toLowerCase(),
      client_phone: bookingData.clientPhone,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      notes: bookingData.notes,
      status: 'CONFIRMED' as BookingStatus,
    };

    // Add staff_id if provided AND it's a valid UUID
    // Mock staff IDs (like 'staff-3') are not valid UUIDs and should not be saved
    if (bookingData.staffId) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingData.staffId);
      if (isUUID) {
        insertData.staff_id = bookingData.staffId;
      }
      // Don't save mock staff IDs - leave staff_id as NULL for guest bookings
    }

    const { data: booking, error } = await client
      .from('bookings')
      .insert(insertData)
      .select(`
        *,
        service:services(*),
        staff:staff_profiles(*)
      `)
      .single();
    
    if (error) {
      console.error('❌ Supabase insert error:', error);
      console.error('❌ Insert error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        insertData,
      });
      throw error;
    }
    
    if (!booking) {
      console.error('Booking was created but could not be retrieved. This might be due to RLS policies.');
      throw new Error('Booking was created but could not be retrieved. This might be due to RLS policies.');
    }
    
    // Ako staff podaci nisu dohvaćeni kroz join (zbog RLS), eksplicitno ih dohvati
    // Ovo je potrebno jer anonimni korisnici možda ne mogu vidjeti staff_profiles kroz join
    if (booking.staff_id && !booking.staff) {
      try {
        // Koristi service role client za dohvaćanje staff podataka (za email)
        const serviceRoleClient = this.getServiceRoleClient();
        if (serviceRoleClient) {
          const { data: staffData } = await serviceRoleClient
            .from('staff_profiles')
            .select('id, email, full_name, role, active, created_at, updated_at')
            .eq('id', booking.staff_id)
            .single();
          
          if (staffData) {
            booking.staff = staffData;
          }
        }
      } catch (staffError) {
        // Ako ne možemo dohvatiti staff podatke, nastavi bez njih
        console.warn('⚠️ Could not fetch staff data for email:', staffError);
      }
    }
    
    return this.formatBooking(booking);
  }

  async getBookingById(id: string, authenticatedClient?: any): Promise<Booking | null> {
    // Use authenticated client if provided (for staff/admin), otherwise use default client
    const client = authenticatedClient || this.client;
    
    const { data, error } = await client
      .from('bookings')
      .select(`
        *,
        service:services(*),
        staff:staff_profiles(*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.formatBooking(data) : null;
  }

  async getBookingByToken(token: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select(`
        *,
        service:services(*)
      `)
      .eq('cancel_token', token)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.formatBooking(data) : null;
  }

  async getBookings(filter: {
    status?: BookingStatus[];
    serviceId?: string;
    dateFrom?: string;
    dateTo?: string;
    clientEmail?: string;
    page?: number;
    limit?: number;
  } = {}, authenticatedClient?: any): Promise<Booking[]> {
    // Use authenticated client if provided (for staff/admin), otherwise use default client
    const client = authenticatedClient || this.client;
    
    // For public users (guests), don't join staff_profiles as they might not have access
    // For authenticated users, include staff profile
    const isPublicUser = !authenticatedClient;
    
    let query = client
      .from('bookings')
      .select(isPublicUser ? `
        *,
        service:services(*)
      ` : `
        *,
        service:services(*),
        staff:staff_profiles(*)
      `);

    if (filter.status) {
      query = query.in('status', filter.status);
    }
    if (filter.serviceId) {
      query = query.eq('service_id', filter.serviceId);
    }
    if (filter.dateFrom && filter.dateTo) {
      query = query
        .gte('start_at', filter.dateFrom)
        .lte('start_at', filter.dateTo);
    }
    if (filter.clientEmail) {
      query = query.ilike('client_email', `%${filter.clientEmail}%`);
    }

    // Only apply pagination if explicitly requested
    // For availability checks, we need ALL bookings for the date range
    if (filter.page !== undefined && filter.limit !== undefined) {
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    query = query.order('start_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    return (data || []).map(this.formatBooking);
  }

  async updateBooking(id: string, updateData: {
    status?: BookingStatus;
    notes?: string;
    adminId?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    serviceId?: string;
    startAt?: Date | string;
    staffId?: string | null;
  }, authenticatedClient?: any): Promise<Booking> {
    // Use authenticated client if provided (for staff/admin), otherwise use default client
    const client = authenticatedClient || this.client;
    
    const updateObj: any = {};
    if (updateData.status !== undefined) updateObj.status = updateData.status;
    if (updateData.notes !== undefined) updateObj.notes = updateData.notes;
    if (updateData.adminId !== undefined) updateObj.admin_id = updateData.adminId;
    if (updateData.clientName !== undefined) updateObj.client_name = updateData.clientName;
    if (updateData.clientEmail !== undefined) updateObj.client_email = updateData.clientEmail.toLowerCase();
    if (updateData.clientPhone !== undefined) updateObj.client_phone = updateData.clientPhone || null;
    if (updateData.serviceId !== undefined) updateObj.service_id = updateData.serviceId;
    if (updateData.staffId !== undefined) {
      // Allow setting to null to remove staff assignment
      updateObj.staff_id = updateData.staffId || null;
    }
    
    // If startAt is provided, calculate endAt based on service duration
    if (updateData.startAt) {
      const startAtDate = updateData.startAt instanceof Date ? updateData.startAt : new Date(updateData.startAt);
      
      // Get service to calculate end time
      let service;
      try {
        if (updateData.serviceId) {
          service = await this.getServiceById(updateData.serviceId);
        } else {
          // Get current booking to find service - use authenticated client if available
          const currentBooking = await this.getBookingById(id, authenticatedClient);
          if (currentBooking?.serviceId) {
            service = await this.getServiceById(currentBooking.serviceId);
          }
        }
        
        if (service) {
          updateObj.start_at = startAtDate.toISOString();
          const endAtDate = new Date(startAtDate.getTime() + service.duration * 60000);
          updateObj.end_at = endAtDate.toISOString();
        } else {
          console.warn('⚠️ Service not found, updating start_at only');
          updateObj.start_at = startAtDate.toISOString();
          // If we can't get service, keep existing end_at or calculate from startAt
        }
      } catch (err: any) {
        console.error('❌ Error getting service for end time calculation:', err);
        // Still update start_at even if we can't calculate end_at
        updateObj.start_at = startAtDate.toISOString();
      }
    }

    console.log('📝 Supabase update object:', updateObj);
    
    const { data: booking, error } = await client
      .from('bookings')
      .update(updateObj)
      .eq('id', id)
      .select(`
        *,
        service:services(*),
        staff:staff_profiles(*)
      `)
      .single();
    
    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }
    
    if (!booking) {
      throw new Error('Booking not found after update');
    }
    
    console.log('✅ Supabase update successful:', booking.id);
    return this.formatBooking(booking);
  }

  async deleteBooking(id: string, authenticatedClient?: any): Promise<void> {
    // Use authenticated client if provided (for staff/admin), otherwise use default client
    const client = authenticatedClient || this.client;
    
    const { error } = await client
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // === STAFF ===
  async getAllStaffMembers(): Promise<StaffProfile[]> {
    try {
      // Koristi service role client ako je dostupan (zaobiđe RLS za anonimne korisnike)
      const serviceRoleClient = this.getServiceRoleClient();
      const client = serviceRoleClient || this.client;
      
      const { data, error } = await client
        .from('staff_profiles')
        .select('id, email, full_name, role, active, created_at, updated_at')
        .eq('active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Could not fetch staff members:', error);
        return [];
      }
      
      return (data || []).map((item) => ({
        id: item.id,
        email: item.email,
        fullName: item.full_name,
        role: item.role,
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (err) {
      console.warn('⚠️ Error fetching staff members:', err);
      return [];
    }
  }

  async getStaffById(id: string): Promise<{ data: StaffProfile | null; error: any }> {
    try {
      // Pokušaj koristiti service role client ako je dostupan (zaobiđe RLS)
      const serviceRoleClient = this.getServiceRoleClient();
      const client = serviceRoleClient || this.client;
      
      const { data, error } = await client
        .from('staff_profiles')
        .select('id, email, full_name, role, active, created_at, updated_at')
        .eq('id', id)
        .single();
      
      if (error) {
        return { data: null, error };
      }
      
      if (!data) {
        return { data: null, error: null };
      }
      
      const staffProfile: StaffProfile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      return { data: staffProfile, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  // === BUSINESS HOURS ===
  async getBusinessHours(): Promise<BusinessHours[]> {
    const { data, error } = await this.client
      .from('business_hours')
      .select('*')
      .eq('active', true)
      .order('day_of_week', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(this.formatBusinessHours);
  }

  // === TIME OFF ===
  async getTimeOff(dateFrom?: string, dateTo?: string, staffId?: string): Promise<TimeOff[]> {
    let query = this.client
      .from('time_off')
      .select('*')
      .eq('active', true);

    if (dateFrom && dateTo) {
      query = query.or(`start_date.gte.${dateFrom},end_date.lte.${dateTo},and(start_date.lte.${dateFrom},end_date.gte.${dateTo})`);
    }

    // Filter: get global time-off (staff_id IS NULL) OR time-off for specific staff
    if (staffId) {
      query = query.or(`staff_id.is.null,staff_id.eq.${staffId}`);
    } else {
      // If no staffId provided, get all (global + all individual)
      // No additional filter needed
    }

    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(this.formatTimeOff);
  }

  async getAllTimeOff(authenticatedClient?: any): Promise<TimeOff[]> {
    const client = authenticatedClient || this.client;
    const { data, error } = await client
      .from('time_off')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(this.formatTimeOff);
  }

  async createTimeOff(timeOff: {
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    allDay?: boolean;
    recurring?: boolean;
    active?: boolean;
    staffId?: string;
  }, authenticatedClient?: any): Promise<TimeOff> {
    const client = authenticatedClient || this.client;
    
    const startDate = typeof timeOff.startDate === 'string' ? timeOff.startDate : timeOff.startDate.toISOString();
    const endDate = typeof timeOff.endDate === 'string' ? timeOff.endDate : timeOff.endDate.toISOString();
    
    const insertData: any = {
      name: timeOff.name,
      start_date: startDate,
      end_date: endDate,
      all_day: timeOff.allDay ?? true,
      recurring: timeOff.recurring ?? false,
      active: timeOff.active ?? true,
    };
    
    // Add staff_id only if provided (null means global for all staff)
    if (timeOff.staffId !== undefined) {
      insertData.staff_id = timeOff.staffId || null;
    }
    
    const { data, error } = await client
      .from('time_off')
      .insert(insertData)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatTimeOff(data);
  }

  async updateTimeOff(id: string, updates: {
    name?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    allDay?: boolean;
    recurring?: boolean;
    active?: boolean;
    staffId?: string | null;
  }, authenticatedClient?: any): Promise<TimeOff> {
    const client = authenticatedClient || this.client;
    
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.startDate !== undefined) {
      updateData.start_date = typeof updates.startDate === 'string' 
        ? updates.startDate 
        : updates.startDate.toISOString();
    }
    if (updates.endDate !== undefined) {
      updateData.end_date = typeof updates.endDate === 'string' 
        ? updates.endDate 
        : updates.endDate.toISOString();
    }
    if (updates.allDay !== undefined) updateData.all_day = updates.allDay;
    if (updates.recurring !== undefined) updateData.recurring = updates.recurring;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.staffId !== undefined) {
      updateData.staff_id = updates.staffId || null;
    }
    
    const { data, error } = await client
      .from('time_off')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return this.formatTimeOff(data);
  }

  async deleteTimeOff(id: string, authenticatedClient?: any): Promise<void> {
    const client = authenticatedClient || this.client;
    
    const { error } = await client
      .from('time_off')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // === HELPER METHODS ===
  private formatBooking = (data: any): Booking => {
    try {
      // Provjeri da li su datumi validni
      const startAt = data.start_at ? new Date(data.start_at) : new Date();
      const endAt = data.end_at ? new Date(data.end_at) : new Date();
      const createdAt = data.created_at ? new Date(data.created_at) : new Date();
      const updatedAt = data.updated_at ? new Date(data.updated_at) : new Date();

      // Provjeri da li su datumi validni
      if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
        console.warn('⚠️ Invalid date in booking:', data.id, {
          start_at: data.start_at,
          end_at: data.end_at,
        });
      }

      return {
        id: data.id,
        clientName: data.client_name || 'N/A',
        clientEmail: data.client_email || '',
        clientPhone: data.client_phone,
        serviceId: data.service_id,
        service: data.service ? this.formatService(data.service) : undefined,
        startAt,
        endAt,
        status: data.status,
        notes: data.notes,
        googleEventId: data.google_event_id,
        outlookEventId: data.outlook_event_id,
        cancelToken: data.cancel_token || '',
        adminId: data.admin_id,
        staffId: data.staff_id,
        staff: data.staff ? {
          id: data.staff.id,
          email: data.staff.email,
          fullName: data.staff.full_name,
          role: data.staff.role,
          active: data.staff.active,
          createdAt: data.staff.created_at ? new Date(data.staff.created_at) : new Date(),
          updatedAt: data.staff.updated_at ? new Date(data.staff.updated_at) : new Date(),
        } : undefined,
        createdAt,
        updatedAt,
      };
    } catch (err) {
      console.error('❌ Error formatting booking:', data.id, err);
      // Vrati minimalni booking objekt da ne pukne cijeli query
      return {
        id: data.id || 'unknown',
        clientName: data.client_name || 'N/A',
        clientEmail: data.client_email || '',
        serviceId: data.service_id || '',
        startAt: new Date(),
        endAt: new Date(),
        status: data.status || 'PENDING',
        cancelToken: data.cancel_token || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  private formatService = (data: any): Service => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      active: data.active,
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
    };
  }

  private formatBusinessHours = (data: any): BusinessHours => {
    return {
      id: data.id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      active: data.active,
      breaks: data.breaks || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private formatTimeOff = (data: any): TimeOff => {
    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      allDay: data.all_day,
      recurring: data.recurring,
      active: data.active,
      staffId: data.staff_id || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export singleton instance
export const db = new SupabaseService();
