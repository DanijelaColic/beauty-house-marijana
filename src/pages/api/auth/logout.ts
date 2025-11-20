import type { APIRoute } from 'astro';
import { authService } from '../../../lib/auth';


export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Sign out from Supabase
    const { error } = await authService.signOut();

    // Clear cookie
    cookies.delete('staff_session', {
      path: '/',
    });

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Logout API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri odjavi',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

