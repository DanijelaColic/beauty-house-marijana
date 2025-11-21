// Email service using Resend
import { Resend } from 'resend';

const resendApiKey = import.meta.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.error('Missing RESEND_API_KEY environment variable');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
  bookingId: string;
  cancelToken: string;
  notes?: string;
  staffCode?: string; // Kod djelatnika (ID djelatnika)
  staffName?: string; // Ime djelatnika (opcionalno)
}

export async function sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
  if (!resend) {
    console.warn('⚠️ Resend not configured - RESEND_API_KEY missing. Skipping email send.');
    console.warn('⚠️ To enable emails, set RESEND_API_KEY in Vercel environment variables.');
    return true; // Don't fail the booking if email is not configured
  }

  try {
    console.log('📧 Attempting to send booking confirmation email to:', data.clientEmail);
    
    const { data: emailResponse, error } = await resend.emails.send({
      from: 'Beauty House by Marijana Talović <onboarding@resend.dev>',
      to: [data.clientEmail],
      subject: `Potvrda rezervacije - ${data.serviceName}`,
      html: generateBookingConfirmationHTML(data),
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    if (emailResponse?.id) {
      console.log('✅ Booking confirmation email sent successfully!');
      console.log('✅ Email ID:', emailResponse.id);
      console.log('✅ Sent to:', data.clientEmail);
      return true;
    }

    console.warn('⚠️ Email sent but no response ID received');
    return true; // Assume success if no error
  } catch (error) {
    console.error('❌ Email sending exception:', error);
    if (error instanceof Error) {
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
    }
    return false;
  }
}

export async function sendAdminNotification(data: BookingEmailData): Promise<boolean> {
  if (!resend) {
    console.warn('Resend not configured, skipping admin notification');
    return true; // Don't fail the booking if email is not configured
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Beauty House by Marijana Talović <onboarding@resend.dev>',
      to: ['dgaric1@gmail.com'],
      subject: `Nova rezervacija - ${data.serviceName}`,
      html: generateAdminNotificationHTML(data),
    });

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    console.log('✅ Admin notification sent');
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

function generateBookingConfirmationHTML(data: BookingEmailData): string {
  // Debug log za provjeru podataka u email template-u
  console.log('📧 Generating email HTML with data:', {
    staffName: data.staffName,
    staffCode: data.staffCode,
    hasStaffName: !!data.staffName,
  });
  
  const formatDate = (date: Date | string) => {
    // Ensure we have a Date object
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Use toLocaleString to format in Croatian locale with timezone awareness
    return dateObj.toLocaleString('hr-HR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Zagreb', // Explicitly set timezone to avoid issues
    });
  };

  const cancelUrl = `${import.meta.env.PUBLIC_SITE_URL || 'https://beauty-house-marijana.vercel.app'}/rezervacije/otkazi?token=${data.cancelToken}`;
  
  // Generiraj HTML za djelatnika ako postoji
  const staffHtml = data.staffName ? `<p><strong>Djelatnik:</strong> ${data.staffName}</p>` : '';
  
  // Generiraj HTML za napomenu ako postoji
  const notesHtml = data.notes ? `<p><strong>Napomena:</strong> ${data.notes}</p>` : '';
  
  // Debug log za provjeru generiranog HTML-a
  console.log('📧 Generated staff HTML:', {
    staffHtml: staffHtml,
    staffName: data.staffName,
    hasStaffHtml: !!staffHtml,
  });

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
            <p><strong>Trajanje:</strong> ${Math.round((data.endAt.getTime() - data.startAt.getTime()) / (1000 * 60))} minuta</p>
            <p><strong>Broj rezervacije:</strong> ${data.bookingId}</p>
            ${staffHtml}
            ${notesHtml}
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

function generateAdminNotificationHTML(data: BookingEmailData): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('hr-HR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            <p><strong>Trajanje:</strong> ${Math.round((data.endAt.getTime() - data.startAt.getTime()) / (1000 * 60))} minuta</p>
            <p><strong>Broj rezervacije:</strong> ${data.bookingId}</p>
            ${data.notes ? `<p><strong>Napomena:</strong> ${data.notes}</p>` : ''}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
