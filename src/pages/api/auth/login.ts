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

    // Get staff profile - use service role client to bypass RLS during login
    // This ensures we can always check if user has a staff profile, regardless of RLS policies
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let profileData = null;
    let profileError = null;
    
    // Try with service role client first (bypasses RLS)
    if (serviceRoleKey && supabaseUrl) {
      const { createClient } = await import('@supabase/supabase-js');
      const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        db: { schema: 'public' },
      });
      
      console.log('🔑 Using service role client to fetch staff profile (bypasses RLS)');
      const { data, error } = await serviceClient
        .from('staff_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      profileData = data;
      profileError = error;
      
      if (profileError && profileError.code === 'PGRST116') {
        // Try with id as fallback
        console.log('⚠️ Profile not found with user_id, trying with id...');
        const { data: altData, error: altError } = await serviceClient
          .from('staff_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (!altError && altData) {
          profileData = altData;
          profileError = null;
          console.log('✅ Found profile using id instead of user_id');
        } else {
          // Try with email as last resort
          console.log('⚠️ Profile not found with id, trying with email...');
          const { data: emailData, error: emailError } = await serviceClient
            .from('staff_profiles')
            .select('*')
            .eq('email', authData.user.email?.toLowerCase())
            .single();
          
          if (!emailError && emailData) {
            profileData = emailData;
            profileError = null;
            console.log('✅ Found profile using email:', authData.user.email);
          }
        }
      }
    } else {
      // Fallback to authenticated client if service role key is not available
      console.log('⚠️ Service role key not available, using authenticated client');
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();
      
      profileData = data;
      profileError = error;
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('⚠️ Profile not found with user_id, trying with id...');
        const { data: altData, error: altError } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (!altError && altData) {
          profileData = altData;
          profileError = null;
          console.log('✅ Found profile using id instead of user_id');
        } else {
          // Try with email as last resort
          console.log('⚠️ Profile not found with id, trying with email...');
          const { data: emailData, error: emailError } = await supabase
            .from('staff_profiles')
            .select('*')
            .eq('email', authData.user.email?.toLowerCase())
            .single();
          
          if (!emailError && emailData) {
            profileData = emailData;
            profileError = null;
            console.log('✅ Found profile using email:', authData.user.email);
          }
        }
      }
    }

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
      profileUserId: profileData?.user_id,
      authUserId: authData.user.id,
      authUserEmail: authData.user.email,
      usedServiceRole: !!serviceRoleKey,
    });

    if (profileError || !profileData) {
      console.error('❌ Staff profile error:', {
        error: profileError,
        hasProfile: !!profileData,
        userId: authData.user.id,
      });
      // Sign out if not authorized
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: !profileData ? "Niste autorizirani kao osoblje. Provjerite da li postoji staff_profiles zapis za vaš korisnički račun." : "Greška pri dohvaćanju profila",
          details: import.meta.env.DEV ? {
            message: profileError?.message,
            code: profileError?.code,
            details: profileError?.details,
            hint: profileError?.hint,
            userId: authData.user.id,
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
    // Note: Supabase SSR client already sets auth cookies automatically
    try {
      cookies.set('staff_session', JSON.stringify({
        userId: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      }), {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD, // Use secure cookies in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      console.log('✅ Staff session cookie set successfully');
    } catch (cookieError) {
      console.error('⚠️ Error setting staff_session cookie:', cookieError);
      // Don't fail login if custom cookie fails - Supabase cookies are already set
    }

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
