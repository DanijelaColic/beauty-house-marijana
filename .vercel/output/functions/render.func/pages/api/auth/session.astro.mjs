import { a as authService } from '../../../chunks/auth_sPpvu-M_.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ cookies }) => {
  try {
    const { session, error } = await authService.getSession();
    if (error) {
      cookies.delete("staff_session", { path: "/" });
      return new Response(
        JSON.stringify({
          success: false,
          error
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (!session) {
      cookies.delete("staff_session", { path: "/" });
      return new Response(
        JSON.stringify({
          success: false,
          error: "Niste prijavljeni"
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    cookies.set("staff_session", JSON.stringify({
      userId: session.user.id,
      email: session.user.email,
      role: session.profile.role
    }), {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
      // 7 days
    });
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: session.user,
          profile: session.profile
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("Session API error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Greška pri provjeri sesije"
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
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
