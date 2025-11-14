// Authentication utilities for staff
import { supabase } from './supabase';
import type { StaffProfile, AuthSession } from '@/types';
import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export class AuthService {
  /**
   * Sign in staff member with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{ session: AuthSession | null; error: string | null }> {
    try {
      console.log('🔐 POČETAK PRIJAVE za:', email);
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔑 SUPABASE AUTH REZULTAT:', { 
        uspjeh: !authError, 
        korisnikId: authData?.user?.id,
        greška: authError?.message,
        korisnikEmail: authData?.user?.email
      });

      if (authError) {
        console.error('❌ GREŠKA AUTENTIFIKACIJE:', authError.message);
        return { session: null, error: authError.message };
      }

      if (!authData.user) {
        console.error('❌ NEMA KORISNIČKIH PODATAKA');
        return { session: null, error: 'Prijava nije uspjela' };
      }

      console.log('👤 DOHVAĆAM STAFF PROFIL za korisnik ID:', authData.user.id);

      // Get staff profile
      const profile = await this.getStaffProfile(authData.user.id);

      console.log('📋 STAFF PROFIL REZULTAT:', profile ? {
        id: profile.id,
        email: profile.email,
        uloga: profile.role,
        aktivan: profile.active,
        punoIme: profile.fullName
      } : 'PROFIL NIJE PRONAĐEN');

      if (!profile) {
        console.error('❌ STAFF PROFIL NIJE PRONAĐEN - odjavljujem korisnika');
        await supabase.auth.signOut();
        return { session: null, error: 'Niste autorizirani kao osoblje' };
      }

      if (!profile.active) {
        console.error('❌ STAFF PROFIL NIJE AKTIVAN - odjavljujem korisnika');
        await supabase.auth.signOut();
        return { session: null, error: 'Vaš račun je deaktiviran' };
      }

      console.log('✅ PRIJAVA USPJEŠNA za:', profile.email, 'Uloga:', profile.role);

      const session: AuthSession = {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
        },
        profile,
      };

      return { session, error: null };
    } catch (err) {
      console.error('💥 GREŠKA PRI PRIJAVI:', err);
      return { session: null, error: `Greška pri prijavi: ${err.message}` };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: 'Došlo je do greške pri odjavi' };
    }
  }

  /**
   * Get current session (both client and server side)
   */
  async getSession(): Promise<{ session: AuthSession | null; error: string | null }> {
    try {
      const {
        data: { session: authSession },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        return { session: null, error: sessionError.message };
      }

      if (!authSession) {
        return { session: null, error: null };
      }

      // Get staff profile
      const profile = await this.getStaffProfile(authSession.user.id);

      if (!profile || !profile.active) {
        // Clear invalid session
        await supabase.auth.signOut();
        return { session: null, error: null };
      }

      const session: AuthSession = {
        user: {
          id: authSession.user.id,
          email: authSession.user.email!,
        },
        profile,
      };

      return { session, error: null };
    } catch (err) {
      console.error('Get session error:', err);
      return { session: null, error: 'Greška pri provjeri sesije' };
    }
  }

  /**
   * Get staff profile from database
   */
  async getStaffProfile(userId: string): Promise<StaffProfile | null> {
    try {
      console.log('🔍 TRAŽIM STAFF PROFIL za user_id:', userId);
      
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('📊 BAZA PODATAKA ODGOVOR:', { 
        pronađen: !!data, 
        greška: error?.message,
        greškaKod: error?.code,
        greškaDetalji: error?.details,
        podaci: data ? {
          id: data.id,
          user_id: data.user_id,
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          active: data.active
        } : null
      });

      if (error) {
        console.error('❌ GREŠKA BAZE PODATAKA:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        return null;
      }

      if (!data) {
        console.error('❌ NEMA PODATAKA ZA KORISNIKA:', userId);
        return null;
      }

      const profile = {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      console.log('✅ KREIRAN STAFF PROFIL OBJEKT:', profile);
      return profile;
    } catch (err) {
      console.error('💥 GREŠKA U getStaffProfile:', err);
      return null;
    }
  }

  /**
   * Check if user is owner
   */
  async isOwner(userId: string): Promise<boolean> {
    const profile = await this.getStaffProfile(userId);
    return profile?.role === 'owner' && profile.active;
  }

  /**
   * Check if user is staff (any role)
   */
  async isStaff(userId: string): Promise<boolean> {
    const profile = await this.getStaffProfile(userId);
    return !!profile && profile.active;
  }

  /**
   * Create a new staff member (owner only)
   */
  async createStaffMember(data: {
    email: string;
    password: string;
    fullName?: string;
    role: 'owner' | 'staff';
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      // This should be called from a server endpoint with proper authorization
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName || '',
          role: data.role,
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Create staff member error:', err);
      return { success: false, error: 'Greška pri kreiranju osoblja' };
    }
  }

  /**
   * Update staff profile
   */
  async updateStaffProfile(
    userId: string,
    updates: {
      fullName?: string;
      active?: boolean;
      role?: 'owner' | 'staff';
    }
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const updateData: any = {};
      if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.role !== undefined) updateData.role = updates.role;

      const { error } = await supabase
        .from('staff_profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Update staff profile error:', err);
      return { success: false, error: 'Greška pri ažuriranju profila' };
    }
  }

  /**
   * Get all staff members (for admin panel)
   */
  async getAllStaffMembers(): Promise<StaffProfile[]> {
    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get staff members error:', error);
        return [];
      }

      return (data || []).map((item) => ({
        id: item.id,
        email: item.email,
        fullName: item.full_name,
        role: item.role,
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      }));
    } catch (err) {
      console.error('Get all staff members error:', err);
      return [];
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Server-side auth check helper for API routes
export async function requireAuth(request: Request, cookies?: AstroCookies): Promise<{
  authorized: boolean;
  session: AuthSession | null;
  error?: string;
}> {
  try {
    // If cookies are provided, use authenticated Supabase client
    if (cookies) {
      const authenticatedClient = createAuthenticatedSupabaseClient(cookies);
      const { data: { user }, error: userError } = await authenticatedClient.auth.getUser();
      
      if (!userError && user) {
        // Get staff profile using authenticated client (to respect RLS policies)
        const { data: profileData, error: profileError } = await authenticatedClient
          .from('staff_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError || !profileData || !profileData.active) {
          return { 
            authorized: false, 
            session: null, 
            error: !profileData ? 'Niste autorizirani kao osoblje' : 'Vaš račun je deaktiviran' 
          };
        }
        
        const profile = {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          role: profileData.role,
          active: profileData.active,
          createdAt: new Date(profileData.created_at),
          updatedAt: new Date(profileData.updated_at),
        };
        
        const session: AuthSession = {
          user: {
            id: user.id,
            email: user.email || profile.email,
          },
          profile,
        };
        
        return { authorized: true, session };
      }
    }

    // Fallback: Try to get token from Authorization header first (for API calls from client)
    const authHeader = request.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data.user) {
        userId = data.user.id;
      }
    }

    // Fallback to session check if no valid Bearer token
    if (!userId) {
      const { session: supabaseSession } = await authService.getSession();
      
      if (supabaseSession) {
        userId = supabaseSession.user.id;
      }
    }

    // If still no user, return unauthorized
    if (!userId) {
      return { authorized: false, session: null, error: 'Missing authorization' };
    }

    // Get staff profile
    const profile = await authService.getStaffProfile(userId);

    if (!profile || !profile.active) {
      return { authorized: false, session: null, error: 'Not authorized' };
    }
    
    const session: AuthSession = {
      user: {
        id: userId,
        email: profile.email,
      },
      profile,
    };

    return { authorized: true, session };
  } catch (err) {
    console.error('Auth check error:', err);
    return { authorized: false, session: null, error: 'Auth check failed' };
  }
}

// Check if user is owner (for restricted operations)
export async function requireOwner(request: Request): Promise<{
  authorized: boolean;
  session: AuthSession | null;
  error?: string;
}> {
  const authCheck = await requireAuth(request);

  if (!authCheck.authorized || !authCheck.session) {
    return authCheck;
  }

  if (authCheck.session.profile.role !== 'owner') {
    return { authorized: false, session: null, error: 'Owner access required' };
  }

  return authCheck;
}

/**
 * Create authenticated Supabase client for server-side API routes
 * This client uses cookies to maintain the authenticated session
 */
export function createAuthenticatedSupabaseClient(cookies: AstroCookies) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
    cookies: {
      get: (key: string) => cookies.get(key)?.value,
      set: (key: string, value: string, options: any) => {
        cookies.set(key, value, options);
      },
      remove: (key: string, options: any) => {
        cookies.delete(key, options);
      },
    },
  });
}

