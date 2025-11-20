import type { APIRoute } from 'astro';
import { createAuthenticatedSupabaseClient } from '@/lib/auth';


export const GET: APIRoute = async ({ cookies }) => {
  try {
    console.log('🔍 GET /api/auth/session - Checking session...');
    
    // Use authenticated Supabase client to read session from cookies
    const supabase = createAuthenticatedSupabaseClient(cookies);
    
    // Get Supabase user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('👤 Supabase user check:', {
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
      error: userError?.message,
    });

    if (userError || !user) {
      console.error('❌ No Supabase session found:', userError);
      // Clear invalid cookie
      cookies.delete('staff_session', { path: '/' });

      return new Response(
        JSON.stringify({
          success: false,
          error: userError?.message || 'Niste prijavljeni',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get staff profile using authenticated client (to respect RLS policies)
    const { data: profileData, error: profileError } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('📋 Staff profile check:', {
      found: !!profileData,
      error: profileError?.message,
      active: profileData?.active,
    });

    if (profileError || !profileData || !profileData.active) {
      console.error('❌ Staff profile error:', profileError);
      // Clear cookie if not authorized
      cookies.delete('staff_session', { path: '/' });

      return new Response(
        JSON.stringify({
          success: false,
          error: !profileData ? 'Niste autorizirani kao osoblje' : 'Vaš račun je deaktiviran',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const session = {
      user: {
        id: user.id,
        email: user.email || profileData.email,
      },
      profile: {
        id: profileData.id,
        email: profileData.email,
        fullName: profileData.full_name,
        role: profileData.role,
        active: profileData.active,
      },
    };

    // Update cookie with proper options for Vercel
    try {
      const cookieOptions: any = {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      };
      
      // Only set secure flag if we're on HTTPS (Vercel always uses HTTPS)
      if (import.meta.env.PROD) {
        cookieOptions.secure = true;
      }
      
      cookies.set('staff_session', JSON.stringify({
        userId: user.id,
        email: user.email,
        role: profileData.role,
      }), cookieOptions);
    } catch (cookieError) {
      console.error('⚠️ Error updating staff_session cookie:', cookieError);
      // Don't fail session check if cookie update fails
    }

    console.log('✅ Session valid:', { userId: user.id, role: profileData.role });

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
  } catch (err: any) {
    console.error('💥 Session API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Greška pri provjeri sesije',
        details: import.meta.env.DEV ? err.message : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

