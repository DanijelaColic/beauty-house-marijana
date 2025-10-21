export { renderers } from '../../renderers.mjs';

const mockStaff = [
  {
    id: "staff-1",
    name: "Ana Marić",
    avatar: "/team/team-1.jpg",
    description: "Stilistica i frizer",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: "staff-2",
    name: "Petra Novak",
    avatar: "/team/team-2.jpg",
    description: "Specijalist za boju",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: "staff-3",
    name: "Marija Kovač",
    avatar: "/team/team-3.jpg",
    description: "Frizerka i stilistica",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: "staff-4",
    name: "Sara Babić",
    avatar: "/team/team-4.jpg",
    description: "Beauty specijalist",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: "staff-5",
    name: "Nina Jurić",
    avatar: "/team/team-5.jpg",
    description: "Frizer i kolorist",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: "staff-6",
    name: "Elena Božić",
    avatar: "/team/team-6.jpg",
    description: "Hair stylist",
    active: true,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
];

const prerender = false;
const GET = async () => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: mockStaff
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error fetching staff:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri dohvaćanju djelatnika",
        details: process.env.NODE_ENV === "development" ? error.message : void 0
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
