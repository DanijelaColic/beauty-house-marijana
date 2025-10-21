import type { APIRoute } from 'astro';
import { authService } from '@/lib/auth';


export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Check Supabase session
    const { session, error } = await authService.getSession();

    if (error) {
      // Clear invalid cookie
      cookies.delete('staff_session', { path: '/' });

      return new Response(
        JSON.stringify({
          success: false,
          error,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!session) {
      // Clear cookie if no session
      cookies.delete('staff_session', { path: '/' });

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Niste prijavljeni',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Update cookie
    cookies.set('staff_session', JSON.stringify({
      userId: session.user.id,
      email: session.user.email,
      role: session.profile.role,
    }), {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: session.user,
          profile: session.profile,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Session API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri provjeri sesije',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

