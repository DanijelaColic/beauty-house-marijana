import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fzhpazheyemdmrtzdckl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aHBhemhleWVtZG1ydHpkY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgxOTcsImV4cCI6MjA3NDIwNDE5N30.n48ZTt7xco6M4nQRRvrgf3W91GNq6JzwsGIZ_IcBLpo";
const supabase = createClient(supabaseUrl, supabaseKey);
class SupabaseService {
  client = supabase;
  // === SERVICES ===
  async getServices() {
    const { data, error } = await this.client.from("services").select("*").eq("active", true);
    if (error) throw error;
    return (data || []).map(this.formatService);
  }
  async getServiceById(id) {
    const { data, error } = await this.client.from("services").select("*").eq("id", id).single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  }
  // === BOOKINGS ===
  async createBooking(bookingData) {
    const service = await this.getServiceById(bookingData.serviceId);
    if (!service) {
      throw new Error("Service not found");
    }
    const startAt = new Date(bookingData.startAt);
    const endAt = new Date(startAt.getTime() + service.duration * 6e4);
    const { data: booking, error } = await this.client.from("bookings").insert({
      service_id: bookingData.serviceId,
      client_name: bookingData.clientName,
      client_email: bookingData.clientEmail.toLowerCase(),
      client_phone: bookingData.clientPhone,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      notes: bookingData.notes,
      status: "CONFIRMED"
    }).select(`
        *,
        service:services(*)
      `).single();
    if (error) throw error;
    return this.formatBooking(booking);
  }
  async getBookingById(id) {
    const { data, error } = await this.client.from("bookings").select(`
        *,
        service:services(*)
      `).eq("id", id).single();
    if (error && error.code !== "PGRST116") throw error;
    return data ? this.formatBooking(data) : null;
  }
  async getBookingByToken(token) {
    const { data, error } = await this.client.from("bookings").select(`
        *,
        service:services(*)
      `).eq("cancel_token", token).single();
    if (error && error.code !== "PGRST116") throw error;
    return data ? this.formatBooking(data) : null;
  }
  async getBookings(filter = {}) {
    let query = this.client.from("bookings").select(`
        *,
        service:services(*)
      `);
    if (filter.status) {
      query = query.in("status", filter.status);
    }
    if (filter.serviceId) {
      query = query.eq("service_id", filter.serviceId);
    }
    if (filter.dateFrom && filter.dateTo) {
      query = query.gte("start_at", filter.dateFrom).lte("start_at", filter.dateTo);
    }
    if (filter.clientEmail) {
      query = query.ilike("client_email", `%${filter.clientEmail}%`);
    }
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order("start_at", { ascending: false }).range(from, to);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(this.formatBooking);
  }
  async updateBooking(id, updateData) {
    const updateObj = {};
    if (updateData.status) updateObj.status = updateData.status;
    if (updateData.notes !== void 0) updateObj.notes = updateData.notes;
    if (updateData.adminId) updateObj.admin_id = updateData.adminId;
    const { data: booking, error } = await this.client.from("bookings").update(updateObj).eq("id", id).select(`
        *,
        service:services(*)
      `).single();
    if (error) throw error;
    return this.formatBooking(booking);
  }
  // === BUSINESS HOURS ===
  async getBusinessHours() {
    const { data, error } = await this.client.from("business_hours").select("*").eq("active", true).order("day_of_week", { ascending: true });
    if (error) throw error;
    return (data || []).map(this.formatBusinessHours);
  }
  // === TIME OFF ===
  async getTimeOff(dateFrom, dateTo) {
    let query = this.client.from("time_off").select("*").eq("active", true);
    if (dateFrom && dateTo) {
      query = query.or(`start_date.gte.${dateFrom},end_date.lte.${dateTo},and(start_date.lte.${dateFrom},end_date.gte.${dateTo})`);
    }
    const { data, error } = await query.order("start_date", { ascending: true });
    if (error) throw error;
    return (data || []).map(this.formatTimeOff);
  }
  // === HELPER METHODS ===
  formatBooking = (data) => {
    return {
      id: data.id,
      clientName: data.client_name,
      clientEmail: data.client_email,
      clientPhone: data.client_phone,
      serviceId: data.service_id,
      service: data.service ? this.formatService(data.service) : void 0,
      startAt: new Date(data.start_at),
      endAt: new Date(data.end_at),
      status: data.status,
      notes: data.notes,
      googleEventId: data.google_event_id,
      outlookEventId: data.outlook_event_id,
      cancelToken: data.cancel_token,
      adminId: data.admin_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };
  formatService = (data) => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      active: data.active,
      createdAt: data.created_at ? new Date(data.created_at) : /* @__PURE__ */ new Date(),
      updatedAt: data.updated_at ? new Date(data.updated_at) : /* @__PURE__ */ new Date()
    };
  };
  formatBusinessHours = (data) => {
    return {
      id: data.id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      active: data.active,
      breaks: data.breaks || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };
  formatTimeOff = (data) => {
    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      allDay: data.all_day,
      recurring: data.recurring,
      active: data.active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  };
}
const db = new SupabaseService();

export { db as d };
