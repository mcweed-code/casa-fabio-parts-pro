import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ClientProfile {
  id: string;
  user_id: string;
  razon_social: string;
  cuit_dni: string;
  email: string;
  whatsapp: string;
  direccion: string | null;
  email_verified: boolean;
  whatsapp_verified: boolean;
  setup_completed: boolean;
}

interface ClientCoefficients {
  id: string;
  user_id: string;
  mode: 'general' | 'by_category';
  general_coef: number;
  category_coefs: Record<string, number>;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ClientProfile | null;
  coefficients: ClientCoefficients | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCoefficients: () => Promise<void>;
  isSetupComplete: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [coefficients, setCoefficients] = useState<ClientCoefficients | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as ClientProfile | null;
  };

  const fetchCoefficients = async (userId: string) => {
    const { data, error } = await supabase
      .from('client_coefficients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching coefficients:', error);
      return null;
    }
    return data as ClientCoefficients | null;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const refreshCoefficients = async () => {
    if (user) {
      const coefData = await fetchCoefficients(user.id);
      setCoefficients(coefData);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            const coefData = await fetchCoefficients(session.user.id);
            setCoefficients(coefData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setCoefficients(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        const coefData = await fetchCoefficients(session.user.id);
        setCoefficients(coefData);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCoefficients(null);
  };

  const isSetupComplete = !!profile?.setup_completed;

  const value = {
    user,
    session,
    profile,
    coefficients,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    refreshCoefficients,
    isSetupComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
