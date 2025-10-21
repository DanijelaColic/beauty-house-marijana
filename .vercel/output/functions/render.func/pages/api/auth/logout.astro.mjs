import { a as authService } from '../../../chunks/auth_sPpvu-M_.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ cookies }) => {
  try {
    const { error } = await authService.signOut();
    cookies.delete("staff_session", {
      path: "/"
    });
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Logout API error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri odjavi"
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
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
