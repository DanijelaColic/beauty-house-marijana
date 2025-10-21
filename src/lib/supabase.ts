// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { 
  Service, 
  Booking, 
  BusinessHours, 
  TimeOff,
  BookingStatus 
} from '@/types';

// Environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
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
  async createBooking(bookingData: {
    serviceId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    startAt: string; // ISO datetime
    notes?: string;
  }): Promise<Booking> {
    // Get service to calculate end time
    const service = await this.getServiceById(bookingData.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const startAt = new Date(bookingData.startAt);
    const endAt = new Date(startAt.getTime() + service.duration * 60000); // duration is in minutes

    const { data: booking, error } = await this.client
      .from('bookings')
      .insert({
        service_id: bookingData.serviceId,
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail.toLowerCase(),
        client_phone: bookingData.clientPhone,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        notes: bookingData.notes,
        status: 'CONFIRMED' as BookingStatus,
      })
      .select(`
        *,
        service:services(*)
      `)
      .single();
    
    if (error) throw error;
    return this.formatBooking(booking);
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await this.client
      .from('bookings')
      .select(`
        *,
        service:services(*)
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
  } = {}): Promise<Booking[]> {
    let query = this.client
      .from('bookings')
      .select(`
        *,
        service:services(*)
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

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order('start_at', { ascending: false })
      .range(from, to);

    const { data, error } = await query;
    
    if (error) throw error;
    return (data || []).map(this.formatBooking);
  }

  async updateBooking(id: string, updateData: {
    status?: BookingStatus;
    notes?: string;
    adminId?: string;
  }): Promise<Booking> {
    const updateObj: any = {};
    if (updateData.status) updateObj.status = updateData.status;
    if (updateData.notes !== undefined) updateObj.notes = updateData.notes;
    if (updateData.adminId) updateObj.admin_id = updateData.adminId;

    const { data: booking, error } = await this.client
      .from('bookings')
      .update(updateObj)
      .eq('id', id)
      .select(`
        *,
        service:services(*)
      `)
      .single();
    
    if (error) throw error;
    return this.formatBooking(booking);
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
  async getTimeOff(dateFrom?: string, dateTo?: string): Promise<TimeOff[]> {
    let query = this.client
      .from('time_off')
      .select('*')
      .eq('active', true);

    if (dateFrom && dateTo) {
      query = query.or(`start_date.gte.${dateFrom},end_date.lte.${dateTo},and(start_date.lte.${dateFrom},end_date.gte.${dateTo})`);
    }

    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(this.formatTimeOff);
  }

  // === HELPER METHODS ===
  private formatBooking = (data: any): Booking => {
    return {
      id: data.id,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientPhone: data.client_phone,
      serviceId: data.service_id,
      service: data.service ? this.formatService(data.service) : undefined,
      startAt: new Date(data.start_at),
      endAt: new Date(data.end_at),
      status: data.status,
      notes: data.notes,
      googleEventId: data.google_event_id,
      outlookEventId: data.outlook_event_id,
      cancelToken: data.cancel_token,
      adminId: data.admin_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
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
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// Export singleton instance
export const db = new SupabaseService();
