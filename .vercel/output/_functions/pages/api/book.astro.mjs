import { b as bookingCreateRequestSchema } from '../../chunks/validation_DlZn1w71.mjs';
import { d as db } from '../../chunks/supabase_lS9oiJyB.mjs';
import { Resend } from 'resend';
export { renderers } from '../../renderers.mjs';

const resend = new Resend("re_WwwsEZXF_7TrwPYHTWNRBJ1LoMRwWYqZ5");
async function sendBookingConfirmation(data) {
  try {
    const { error } = await resend.emails.send({
      from: "Beauty House by Marijana Talović <onboarding@resend.dev>",
      to: [data.clientEmail],
      subject: `Potvrda rezervacije - ${data.serviceName}`,
      html: generateBookingConfirmationHTML(data)
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    console.log("✅ Booking confirmation email sent to:", data.clientEmail);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}
async function sendAdminNotification(data) {
  try {
    const { error } = await resend.emails.send({
      from: "Beauty House by Marijana Talović <onboarding@resend.dev>",
      to: ["dgaric1@gmail.com"],
      subject: `Nova rezervacija - ${data.serviceName}`,
      html: generateAdminNotificationHTML(data)
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    console.log("✅ Admin notification sent");
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}
function generateBookingConfirmationHTML(data) {
  const formatDate = (date) => {
    return date.toLocaleDateString("hr-HR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const cancelUrl = `${":https://beauty-house-marijana.vercel.app/"}/rezervacije/otkazi?token=${data.cancelToken}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Potvrda rezervacije</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7B5E3B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { background: #C6A15B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .cancel-link { color: #7B5E3B; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Beauty House by Marijana Talović</h1>
          <h2>Potvrda rezervacije</h2>
        </div>
        
        <div class="content">
          <p>Poštovani/a ${data.clientName},</p>
          
          <p>Vaša rezervacija je uspješno potvrđena! Evo detalja:</p>
          
          <div class="booking-details">
            <h3>Detalji rezervacije</h3>
            <p><strong>Usluga:</strong> ${data.serviceName}</p>
            <p><strong>Datum i vrijeme:</strong> ${formatDate(data.startAt)}</p>
            <p><strong>Trajanje:</strong> ${Math.round((data.endAt.getTime() - data.startAt.getTime()) / (1e3 * 60))} minuta</p>
            <p><strong>Broj rezervacije:</strong> ${data.bookingId}</p>
            ${data.notes ? `<p><strong>Napomena:</strong> ${data.notes}</p>` : ""}
          </div>
          
          <p><strong>Važne informacije:</strong></p>
          <ul>
            <li>Molimo dođite 5 minuta prije zakazanog termina</li>
            <li>Naša adresa: Ulica Jela 79, Osijek</li>
            <li>Telefon: +385 31 280 678</li>
            <li>Možete otkazati rezervaciju do 24 sata prije termina</li>
          </ul>
          
          <p>
            <a href="${cancelUrl}" class="cancel-link">Otkaži rezervaciju</a>
          </p>
          
          <p>Hvala vam što ste odabrali Beauty House by Marijana Talović!</p>
        </div>
        
        <div class="footer">
          <p>Beauty House by Marijana Talović<br>
          Ulica Jela 79, Osijek<br>
          Tel: +385 31 280 678<br>
          Email: info@beautyhouse.hr</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateAdminNotificationHTML(data) {
  const formatDate = (date) => {
    return date.toLocaleDateString("hr-HR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova rezervacija</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #7B5E3B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova rezervacija</h1>
        </div>
        
        <div class="content">
          <div class="booking-details">
            <h3>Detalji rezervacije</h3>
            <p><strong>Klijent:</strong> ${data.clientName}</p>
            <p><strong>Email:</strong> ${data.clientEmail}</p>
            <p><strong>Usluga:</strong> ${data.serviceName}</p>
            <p><strong>Datum i vrijeme:</strong> ${formatDate(data.startAt)}</p>
            <p><strong>Trajanje:</strong> ${Math.round((data.endAt.getTime() - data.startAt.getTime()) / (1e3 * 60))} minuta</p>
            <p><strong>Broj rezervacije:</strong> ${data.bookingId}</p>
            ${data.notes ? `<p><strong>Napomena:</strong> ${data.notes}</p>` : ""}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("Booking request body:", body);
    const validationResult = bookingCreateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Booking validation errors:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Neispravni podaci",
          details: validationResult.error.errors
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const data = validationResult.data;
    const service = await db.getServiceById(data.serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Usluga nije pronađena"
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    const booking = await db.createBooking({
      serviceId: data.serviceId,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      startAt: data.startAt,
      notes: data.notes
    });
    const startDate = new Date(data.startAt);
    const endDate = new Date(booking.endAt);
    const googleParams = new URLSearchParams({
      action: "TEMPLATE",
      text: `${service.name} - Beauty House by Marijana Talović`,
      dates: `${startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}/${endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
      details: `Rezervacija: ${service.name}
Klijent: ${data.clientName}
Email: ${data.clientEmail}${data.clientPhone ? `
Telefon: ${data.clientPhone}` : ""}${data.notes ? `
Napomena: ${data.notes}` : ""}`,
      location: "Beauty House by Marijana Talović, Ulica Jela 79, Osijek"
    });
    const outlookParams = new URLSearchParams({
      subject: `${service.name} - Beauty House by Marijana Talović`,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      body: `Rezervacija: ${service.name}
Klijent: ${data.clientName}
Email: ${data.clientEmail}${data.clientPhone ? `
Telefon: ${data.clientPhone}` : ""}${data.notes ? `
Napomena: ${data.notes}` : ""}`,
      location: "Beauty House by Marijana Talović, Ulica Jela 79, Osijek"
    });
    const calendarUrls = {
      google: `https://calendar.google.com/calendar/render?${googleParams.toString()}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${outlookParams.toString()}`,
      ics: "#"
      // TODO: Generate ICS file
    };
    try {
      const emailData = {
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        serviceName: service.name,
        startAt: booking.startAt,
        endAt: booking.endAt,
        bookingId: booking.id,
        cancelToken: booking.cancelToken,
        notes: booking.notes
      };
      await sendBookingConfirmation(emailData);
      await sendAdminNotification(emailData);
      console.log("📧 Emails sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }
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
              duration: service.duration
            }
          },
          calendarUrls
        },
        message: "Rezervacija je uspješno kreirana"
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Dogodila se greška pri kreiranju rezervacije"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};
const OPTIONS = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
