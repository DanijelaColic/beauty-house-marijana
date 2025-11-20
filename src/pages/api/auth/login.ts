import type { APIRoute } from "astro";
import { createAuthenticatedSupabaseClient, authService } from "../../../lib/auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('🔐 POST /api/auth/login - Starting...');
    
    // Check environment variables
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔧 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING',
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error - missing Supabase credentials",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const { email, password } = await request.json();
    console.log('📧 Login attempt for email:', email);
    console.log('🔒 Password provided:', !!password, 'length:', password?.length);

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
    let supabase;
    try {
      supabase = createAuthenticatedSupabaseClient(cookies);
      console.log('✅ Created authenticated Supabase client');
    } catch (clientError: any) {
      console.error('❌ Error creating Supabase client:', clientError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Server configuration error - Unable to initialize authentication",
          details: import.meta.env.DEV ? clientError?.message : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sign in with Supabase Auth - this will automatically set cookies
    const normalizedEmail = String(email).trim().toLowerCase();
    console.log('🔑 Attempting Supabase signInWithPassword...', {
      email: normalizedEmail,
      emailLength: normalizedEmail.length,
    });
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: String(password),
    });

    console.log('🔑 Supabase auth result:', {
      success: !authError && !!authData.user,
      userId: authData?.user?.id,
      email: authData?.user?.email,
      error: authError?.message,
      errorCode: authError?.status,
      errorName: authError?.name,
      hasSession: !!authData?.session,
      hasUser: !!authData?.user,
    });

    if (authError || !authData.user) {
      console.error('❌ Authentication failed:', {
        error: authError,
        message: authError?.message,
        status: authError?.status,
        name: authError?.name,
        email: normalizedEmail,
      });
      
      // Provide more helpful error messages
      let errorMessage = authError?.message || "Invalid login credentials";
      
      // Check for specific error types
      if (authError?.status === 400) {
        errorMessage = "Neispravan format email adrese ili lozinke";
      } else if (authError?.message?.includes('Invalid login credentials')) {
        errorMessage = "Neispravna email adresa ili lozinka. Provjerite da li korisnik postoji u Supabase Auth.";
      } else if (authError?.message?.includes('Email not confirmed')) {
        errorMessage = "Email adresa nije potvrđena. Provjerite svoj inbox.";
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          details: import.meta.env.DEV ? {
            originalError: authError?.message,
            status: authError?.status,
            name: authError?.name,
          } : undefined,
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
    // Note: supabaseUrl is already declared above, reuse it
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let profileData = null;
    let profileError = null;
    
    // Try with service role client first (bypasses RLS)
    if (serviceRoleKey && supabaseUrl) {
      try {
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
      } catch (importError) {
        console.error('⚠️ Error importing or using service role client:', importError);
        // Fall through to authenticated client
      }
    }
    
    // Fallback to authenticated client if service role failed or not available
    if (!profileData && !profileError) {
      try {
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
      } catch (fallbackError) {
        console.error('⚠️ Error using authenticated client fallback:', fallbackError);
        profileError = fallbackError as any;
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
      // Set cookie with proper options for Vercel
      // Note: On Vercel, cookies need to be set with proper domain and secure flags
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
        userId: authData.user.id,
        email: authData.user.email,
        role: profile.role,
      }), cookieOptions);
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
    console.error('💥 Login API error:', err);
    console.error('💥 Error details:', {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      cause: err?.cause,
    });
    
    // Provide more helpful error messages
    let errorMessage = "Internal server error";
    let statusCode = 500;
    
    if (err?.message?.includes('Missing Supabase environment variables')) {
      errorMessage = "Server configuration error - Supabase credentials are missing";
      statusCode = 500;
    } else if (err?.message?.includes('createServerClient')) {
      errorMessage = "Server configuration error - Unable to create Supabase client";
      statusCode = 500;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: import.meta.env.DEV ? {
          message: err?.message,
          name: err?.name,
          stack: err?.stack,
        } : undefined,
      }),
      {
        status: statusCode,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
