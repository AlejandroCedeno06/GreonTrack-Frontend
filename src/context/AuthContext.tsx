import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Perfil } from '../types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  loading: boolean;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  verificarCodigo: (email: string, codigo: string) => Promise<{ error: string | null }>;
  reenviarCodigo: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPerfil = async (userId: string) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    setPerfil(data as Perfil | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadPerfil(session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        loadPerfil(newSession.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }, // usado por el trigger handle_new_user en Supabase
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    // Paso 1 de 2 del login: solo valida la contraseña, no deja la sesión
    // abierta todavía — la sesión real se crea en verificarCodigo() tras
    // confirmar el código de un solo uso que se manda por correo.
    const { error: passwordError } = await supabase.auth.signInWithPassword({ email, password });
    if (passwordError) return { error: passwordError.message };

    await supabase.auth.signOut();

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return { error: otpError?.message ?? null };
  };

  const signInWithGoogle = async () => {
    // Con OAuth, Google ya resuelve la identidad del usuario de punta a punta,
    // así que aquí no aplica el paso extra de código por correo del login
    // con contraseña — la sesión se crea directo al volver del redirect.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  };

  const verificarCodigo = async (email: string, codigo: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    return { error: error?.message ?? null };
  };

  const reenviarCodigo = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshPerfil = async () => {
    if (session?.user) await loadPerfil(session.user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        perfil,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        verificarCodigo,
        reenviarCodigo,
        signOut,
        refreshPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
