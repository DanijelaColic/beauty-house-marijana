import { d as db } from '../../../chunks/supabase_Cjh8S1vc.mjs';
import { r as requireAuth } from '../../../chunks/auth_sPpvu-M_.mjs';
export { renderers } from '../../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.authorized || !authCheck.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authCheck.error || "Nemate pristup ovom resursu"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const serviceId = url.searchParams.get("serviceId");
    const dateFrom = url.searchParams.get("dateFrom");
    const dateTo = url.searchParams.get("dateTo");
    const filter = {};
    if (status) {
      filter.status = status.split(",");
    }
    if (serviceId) {
      filter.serviceId = serviceId;
    }
    if (dateFrom) {
      filter.dateFrom = dateFrom;
    }
    if (dateTo) {
      filter.dateTo = dateTo;
    }
    const bookings = await db.getBookings(filter);
    return new Response(
      JSON.stringify({
        success: true,
        data: bookings
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Admin bookings API error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri učitavanju rezervacija"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
const PATCH = async ({ request }) => {
  try {
    const authCheck = await requireAuth(request);
    if (!authCheck.authorized || !authCheck.session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authCheck.error || "Nemate pristup ovom resursu"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const { bookingId, status, notes } = await request.json();
    if (!bookingId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ID rezervacije je obavezan"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const booking = await db.updateBooking(bookingId, {
      status,
      notes,
      adminId: authCheck.session.user.id
    });
    return new Response(
      JSON.stringify({
        success: true,
        data: booking
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Update booking API error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri ažuriranju rezervacije"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  PATCH
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
