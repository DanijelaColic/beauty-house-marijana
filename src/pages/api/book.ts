// API route for creating bookings
import type { APIRoute } from 'astro';
import { bookingCreateRequestSchema } from '@/lib/validation';
import { db } from '@/lib/supabase';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';
import { mockServices } from '@/lib/mock-services';


export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate input data
    const validationResult = bookingCreateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Neispravni podaci',
          details: validationResult.error.errors,
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = validationResult.data;
    
    // Debug log za provjeru staffId
    console.log('📝 Booking request data:', {
      serviceId: data.serviceId,
      staffId: data.staffId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
    });

    // 3. Get service details
    let service;
    try {
      service = await db.getServiceById(data.serviceId);
    } catch (error) {
      console.log('Database error, falling back to mock services:', error);
      service = mockServices.find(s => s.id === data.serviceId);
    }
    
    if (!service) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usluga nije pronađena',
        }),
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // 4. Create booking
    let booking;
    try {
      booking = await db.createBooking({
        serviceId: data.serviceId,
        staffId: data.staffId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        startAt: data.startAt,
        notes: data.notes,
      });
    } catch (error) {
      console.error('Database error in /api/book:', error);
      console.log('Database error, creating mock booking response:', error);
      // Create a mock booking response when database is not configured
      const startAt = new Date(data.startAt);
      const endAt = new Date(startAt.getTime() + service.duration * 60000);
      
      booking = {
        id: `mock-booking-${Date.now()}`,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        serviceId: data.serviceId,
        service: service,
        startAt: startAt,
        endAt: endAt,
        status: 'CONFIRMED' as const,
        notes: data.notes,
        googleEventId: null,
        outlookEventId: null,
        cancelToken: `mock-token-${Date.now()}`,
        adminId: null,
        staffId: data.staffId || undefined, // Dodaj staffId ako postoji
        staff: undefined, // Mock booking nema staff podatke
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    // 5. Create calendar URLs  
    const startDate = new Date(data.startAt);
    const endDate = new Date(booking.endAt);
    
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${service.name} - Beauty House by Marijana Talović`,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      details: `Rezervacija: ${service.name}\nKlijent: ${data.clientName}\nEmail: ${data.clientEmail}${data.clientPhone ? `\nTelefon: ${data.clientPhone}` : ''}${data.notes ? `\nNapomena: ${data.notes}` : ''}`,
      location: 'Beauty House by Marijana Talović, Ulica Jela 79, Osijek',
    });

    const outlookParams = new URLSearchParams({
      subject: `${service.name} - Beauty House by Marijana Talović`,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: `Rezervacija: ${service.name}\nKlijent: ${data.clientName}\nEmail: ${data.clientEmail}${data.clientPhone ? `\nTelefon: ${data.clientPhone}` : ''}${data.notes ? `\nNapomena: ${data.notes}` : ''}`,
      location: 'Beauty House by Marijana Talović, Ulica Jela 79, Osijek',
    });

    const calendarUrls = {
      google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`,
      ics: '#', // TODO: Generate ICS file
    };

    // 6. Send email confirmations
    try {
      // Ensure dates are Date objects (not strings)
      const startAtDate = booking.startAt instanceof Date ? booking.startAt : new Date(booking.startAt);
      const endAtDate = booking.endAt instanceof Date ? booking.endAt : new Date(booking.endAt);
      
      // Ako staff podaci nisu dohvaćeni kroz join (zbog RLS), eksplicitno ih dohvati
      const bookingStaffId = 'staffId' in booking ? (booking as any).staffId : undefined;
      const bookingStaff = 'staff' in booking ? (booking as any).staff : undefined;
      
      let staffName: string | undefined = bookingStaff?.fullName;
      if (bookingStaffId && !staffName) {
        try {
          // Pokušaj dohvatiti staff podatke
          const staffResult = await db.getStaffById(bookingStaffId);
          if (staffResult.data) {
            staffName = staffResult.data.fullName;
            console.log('✅ Staff name fetched for email:', staffName);
          } else {
            console.warn('⚠️ Could not fetch staff data:', staffResult.error);
          }
        } catch (staffError) {
          // Ako ne možemo dohvatiti staff podatke, nastavi bez njih
          console.warn('⚠️ Could not fetch staff data for email:', staffError);
        }
      }
      
      // Debug log za provjeru
      console.log('📧 Email data:', {
        staffId: bookingStaffId,
        staffName: staffName,
        hasStaffInBooking: !!bookingStaff,
      });
      
      const emailData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        serviceName: service.name,
        startAt: startAtDate,
        endAt: endAtDate,
        bookingId: booking.id,
        cancelToken: booking.cancelToken,
        notes: booking.notes,
        // Dodaj informaciju o djelatniku ako postoji
        staffCode: bookingStaffId || undefined,
        staffName: staffName || undefined,
      };
      
      // Debug log za provjeru emailData
      console.log('📧 Email data being sent:', {
        staffName: emailData.staffName,
        staffCode: emailData.staffCode,
        hasStaffName: !!emailData.staffName,
      });

      // Send confirmation to client
      await sendBookingConfirmation(emailData);
      
      // Send notification to admin
      await sendAdminNotification(emailData);
      
      console.log('📧 Emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the booking if email fails
    }

    // 7. Successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          booking: {
            id: booking.id,
            clientName: booking.clientName,
            startAt: booking.startAt,
            endAt: booking.endAt,
            status: booking.status,
            service: {
              name: service.name,
              duration: service.duration,
            },
          },
          calendarUrls,
        },
        message: 'Rezervacija je uspješno kreirana',
      }),
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );

  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Dogodila se greška pri kreiranju rezervacije',
        details: import.meta.env.DEV ? (error instanceof Error ? error.message : String(error)) : undefined,
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
};

// OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
