/* empty css                                 */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_P_euJCoa.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { B as Button, C as Card } from '../chunks/card_Gl3AMm-5.mjs';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
export { renderers } from '../renderers.mjs';

function AdminLayout({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkSession();
  }, []);
  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProfile(data.data.profile);
        } else {
          window.location.href = "/admin/login";
        }
      } else {
        window.location.href = "/admin/login";
      }
    } catch (err) {
      console.error("Session check error:", err);
      window.location.href = "/admin/login";
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-gray-600", children: "Učitavanje..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-white shadow", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Admin Panel" }),
        profile && /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
          profile.fullName || profile.email,
          " (",
          profile.role === "owner" ? "Vlasnik" : "Osoblje",
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/",
            className: "text-gray-600 hover:text-gray-900 text-sm",
            children: "Početna stranica"
          }
        ),
        /* @__PURE__ */ jsx(Button, { onClick: handleLogout, variant: "outline", size: "sm", children: "Odjavi se" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("nav", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-8", children: [
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/admin",
          className: "border-b-2 border-rose-500 text-gray-900 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium",
          children: "Rezervacije"
        }
      ),
      profile?.role === "owner" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/admin/services",
            className: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium",
            children: "Usluge"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/admin/staff",
            className: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium",
            children: "Osoblje"
          }
        ),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "/admin/settings",
            className: "border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 pb-4 text-sm font-medium",
            children: "Postavke"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children })
  ] });
}

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    loadBookings();
  }, []);
  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/bookings");
      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }
      const data = await response.json();
      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError(data.error || "Greška pri učitavanju rezervacija");
      }
    } catch (err) {
      console.error("Load bookings error:", err);
      setError("Greška pri učitavanju rezervacija");
    } finally {
      setLoading(false);
    }
  };
  const getStatusBadge = (status) => {
    const badges = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      CANCELED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800"
    };
    const labels = {
      CONFIRMED: "Potvrđeno",
      PENDING: "Na čekanju",
      CANCELED: "Otkazano",
      NO_SHOW: "Nije došao"
    };
    return /* @__PURE__ */ jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`, children: labels[status] });
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-gray-600", children: "Učitavanje rezervacija..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx("p", { className: "text-red-600", children: error }),
      /* @__PURE__ */ jsx(Button, { onClick: loadBookings, className: "mt-4", children: "Pokušaj ponovo" })
    ] });
  }
  if (bookings.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Nema rezervacija" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: bookings.map((booking) => /* @__PURE__ */ jsx(Card, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900", children: booking.clientName }),
        getStatusBadge(booking.status)
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Email:" }),
          " ",
          booking.clientEmail
        ] }),
        booking.clientPhone && /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Telefon:" }),
          " ",
          booking.clientPhone
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Usluga:" }),
          " ",
          booking.service?.name || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Termin:" }),
          " ",
          format(booking.startAt, "EEEE, dd.MM.yyyy. u HH:mm", { locale: hr })
        ] }),
        booking.service && /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Trajanje:" }),
          " ",
          booking.service.duration,
          " min"
        ] }),
        booking.notes && /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("strong", { children: "Napomena:" }),
          " ",
          booking.notes
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "ml-4 flex flex-col space-y-2", children: [
      booking.status === "PENDING" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Potvrdi" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Otkaži" })
      ] }),
      booking.status === "CONFIRMED" && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Otkaži" })
    ] })
  ] }) }, booking.id)) });
}

const $$Astro = createAstro();
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const sessionCookie = Astro2.cookies.get("staff_session");
  if (!sessionCookie) {
    return Astro2.redirect("/admin/login");
  }
  try {
    const sessionCheck = await fetch(`${Astro2.url.origin}/api/auth/session`, {
      headers: {
        "Cookie": `staff_session=${sessionCookie.value}`
      }
    });
    if (!sessionCheck.ok) {
      return Astro2.redirect("/admin/login");
    }
  } catch (err) {
    console.error("Session check error:", err);
    return Astro2.redirect("/admin/login");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Admin Panel | Beauty House Marijana", "description": "Admin panel za upravljanje rezervacijama" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "AdminLayout", AdminLayout, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/admin/AdminLayout", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` ${maybeRenderHead()}<div class="space-y-6"> <div> <h2 class="text-2xl font-bold text-gray-900">Rezervacije</h2> <p class="text-gray-600 mt-1">
Pregled svih rezervacija i upravljanje terminima
</p> </div> ${renderComponent($$result3, "BookingsList", BookingsList, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/admin/BookingsList", "client:component-export": "default" })} </div> ` })} ` })}`;
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/admin/index.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
