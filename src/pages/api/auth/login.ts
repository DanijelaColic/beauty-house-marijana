import type { APIRoute } from "astro";
import { createAuthenticatedSupabaseClient } from "@/lib/auth";
import { authService } from "@/lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🔐 POST /api/auth/login - Starting...');
    
    const { email, password } = await request.json();
    console.log('📧 Login attempt for email:', email);

    if (!email || !password) {
      console.error('❌ Missing email or password');
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email and password are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create server-side Supabase client that will handle cookies automatically
    const supabase = createAuthenticatedSupabaseClient(cookies);
    console.log('✅ Created authenticated Supabase client');

    // Sign in with Supabase Auth - this will automatically set cookies
    console.log('🔑 Attempting Supabase signInWithPassword...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    console.log('🔑 Supabase auth result:', {
      success: !authError && !!authData.user,
      userId: authData?.user?.id,
      email: authData?.user?.email,
      error: authError?.message,
      errorCode: authError?.status,
    });

    if (authError || !authData.user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: authError?.message || "Invalid login credentials",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log('✅ Authentication successful, fetching staff profile for user:', authData.user.id);

    // Get staff profile using authenticated client (to respect RLS policies)
    const { data: profileData, error: profileError } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    console.log('📋 Staff profile query result:', {
      found: !!profileData,
      error: profileError?.message,
      errorCode: profileError?.code,
      errorDetails: profileError?.details,
      errorHint: profileError?.hint,
      profileId: profileData?.id,
      profileEmail: profileData?.email,
      profileRole: profileData?.role,
      profileActive: profileData?.active,
    });

    if (profileError || !profileData) {
      console.error('❌ Staff profile error:', {
        error: profileError,
        hasProfile: !!profileData,
      });
      // Sign out if not authorized
      await supabase.auth.signOut();
      return new Response(
        JSON.stringify({
          success: false,
          error: !profileData ? "Niste autorizirani kao osoblje" : "Greška pri dohvaćanju profila",
          details: import.meta.env.DEV ? {
            message: profileError?.message,
            code: profileError?.code,
            details: profileError?.details,
            hint: profileError?.hint,
          } : undefined,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!profileData.active) {
      // Sign out if account is inactive
      await supabase.auth.signOut();
      return new Response(
        JSON.stringify({
          success: false,
          error: "Vaš račun je deaktiviran",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const profile = {
      id: profileData.id,
      email: profileData.email,
      fullName: profileData.full_name,
      role: profileData.role,
      active: profileData.active,
    };

    // Set custom session cookie for quick access (optional, Supabase cookies are already set)
    cookies.set('staff_session', JSON.stringify({
      userId: authData.user.id,
      email: authData.user.email,
      role: profile.role,
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
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        profile: {
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          active: profile.active,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error('Login API error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: import.meta.env.DEV ? err.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
