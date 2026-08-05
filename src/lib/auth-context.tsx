"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signout: () => Promise<void>;
  refreshAuthUser: () => Promise<void>;
  gymName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [gymName, setGymName] = useState<string>();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[AUTH_CONTEXT] Initial session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.gym_name) {
        setGymName(session.user.user_metadata.gym_name);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[AUTH_CONTEXT] Auth state changed. Event:", _event);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.gym_name) {
        setGymName(session.user.user_metadata.gym_name);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const refreshAuthUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setGymName(session?.user?.user_metadata?.gym_name);
    } catch (error) {
      console.error("Failed to refresh auth user:", error);
    }
  };

  const signout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setGymName(undefined);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signout, refreshAuthUser, gymName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
