// API route for creating bookings
import type { APIRoute } from 'astro';
import { bookingCreateRequestSchema } from '@/lib/validation';

export const prerender = false;
import { db } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Parse request body
    const body = await request.json();
    console.log('Booking request body:', body);
    
    // 2. Validate input data
    const validationResult = bookingCreateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Booking validation errors:', validationResult.error.errors);
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

    // 3. Get service details
    const service = await db.getServiceById(data.serviceId);
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
    const booking = await db.createBooking({
      serviceId: data.serviceId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startAt: data.startAt,
      notes: data.notes,
    });
    
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

    // 6. TODO: Send email confirmation (implement later)
    console.log('📧 Email potvrda bi bila poslana na:', booking.clientEmail);
    console.log('📅 Rezervacija kreirana:', booking.id);

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
        },
      }
    );

  } catch (error) {
    console.error('Error creating booking:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Dogodila se greška pri kreiranju rezervacije',
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
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
