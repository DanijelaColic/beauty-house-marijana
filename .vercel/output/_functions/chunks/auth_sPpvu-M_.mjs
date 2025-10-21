import { s as supabase } from './supabase_Cjh8S1vc.mjs';

class AuthService {
  /**
   * Sign in staff member with email and password
   */
  async signIn(email, password) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (authError) {
        return { session: null, error: authError.message };
      }
      if (!authData.user) {
        return { session: null, error: "Prijava nije uspjela" };
      }
      const profile = await this.getStaffProfile(authData.user.id);
      if (!profile) {
        await supabase.auth.signOut();
        return { session: null, error: "Niste autorizirani kao osoblje" };
      }
      if (!profile.active) {
        await supabase.auth.signOut();
        return { session: null, error: "Vaš račun je deaktiviran" };
      }
      const session = {
        user: {
          id: authData.user.id,
          email: authData.user.email
        },
        profile
      };
      return { session, error: null };
    } catch (err) {
      console.error("Sign in error:", err);
      return { session: null, error: "Došlo je do greške pri prijavi" };
    }
  }
  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      console.error("Sign out error:", err);
      return { error: "Došlo je do greške pri odjavi" };
    }
  }
  /**
   * Get current session (both client and server side)
   */
  async getSession() {
    try {
      const {
        data: { session: authSession },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) {
        return { session: null, error: sessionError.message };
      }
      if (!authSession) {
        return { session: null, error: null };
      }
      const profile = await this.getStaffProfile(authSession.user.id);
      if (!profile || !profile.active) {
        await supabase.auth.signOut();
        return { session: null, error: null };
      }
      const session = {
        user: {
          id: authSession.user.id,
          email: authSession.user.email
        },
        profile
      };
      return { session, error: null };
    } catch (err) {
      console.error("Get session error:", err);
      return { session: null, error: "Greška pri provjeri sesije" };
    }
  }
  /**
   * Get staff profile from database
   */
  async getStaffProfile(userId) {
    try {
      const { data, error } = await supabase.from("staff_profiles").select("*").eq("id", userId).single();
      if (error || !data) {
        return null;
      }
      return {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        active: data.active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (err) {
      console.error("Get staff profile error:", err);
      return null;
    }
  }
  /**
   * Check if user is owner
   */
  async isOwner(userId) {
    const profile = await this.getStaffProfile(userId);
    return profile?.role === "owner" && profile.active;
  }
  /**
   * Check if user is staff (any role)
   */
  async isStaff(userId) {
    const profile = await this.getStaffProfile(userId);
    return !!profile && profile.active;
  }
  /**
   * Create a new staff member (owner only)
   */
  async createStaffMember(data) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName || "",
          role: data.role
        }
      });
      if (authError) {
        return { success: false, error: authError.message };
      }
      return { success: true, error: null };
    } catch (err) {
      console.error("Create staff member error:", err);
      return { success: false, error: "Greška pri kreiranju osoblja" };
    }
  }
  /**
   * Update staff profile
   */
  async updateStaffProfile(userId, updates) {
    try {
      const updateData = {};
      if (updates.fullName !== void 0) updateData.full_name = updates.fullName;
      if (updates.active !== void 0) updateData.active = updates.active;
      if (updates.role !== void 0) updateData.role = updates.role;
      const { error } = await supabase.from("staff_profiles").update(updateData).eq("id", userId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err) {
      console.error("Update staff profile error:", err);
      return { success: false, error: "Greška pri ažuriranju profila" };
    }
  }
  /**
   * Get all staff members (for admin panel)
   */
  async getAllStaffMembers() {
    try {
      const { data, error } = await supabase.from("staff_profiles").select("*").order("created_at", { ascending: false });
      if (error) {
        console.error("Get staff members error:", error);
        return [];
      }
      return (data || []).map((item) => ({
        id: item.id,
        email: item.email,
        fullName: item.full_name,
        role: item.role,
        active: item.active,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (err) {
      console.error("Get all staff members error:", err);
      return [];
    }
  }
}
const authService = new AuthService();
async function requireAuth(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    let userId = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        userId = data.user.id;
      }
    }
    if (!userId) {
      const { session: supabaseSession } = await authService.getSession();
      if (supabaseSession) {
        userId = supabaseSession.user.id;
      }
    }
    if (!userId) {
      return { authorized: false, session: null, error: "Missing authorization" };
    }
    const profile = await authService.getStaffProfile(userId);
    if (!profile || !profile.active) {
      return { authorized: false, session: null, error: "Not authorized" };
    }
    const session = {
      user: {
        id: userId,
        email: profile.email
      },
      profile
    };
    return { authorized: true, session };
  } catch (err) {
    console.error("Auth check error:", err);
    return { authorized: false, session: null, error: "Auth check failed" };
  }
}

export { authService as a, requireAuth as r };
