'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  role: 'user' | 'admin';
  display_name: string | null;
  zip_code: string | null;
  favorite_leagues: string[];
  favorite_teams: string[];
  favorite_players: string[];
  collector_level: string | null;
  notify_drops: boolean;
  notify_shows: boolean;
  notify_recap: boolean;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchProfile(userId: string, retries = 3): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && retries > 0) {
      // Retry after a short delay — handles lock race with middleware
      await new Promise(r => setTimeout(r, 300));
      return fetchProfile(userId, retries - 1);
    }

    if (data) {
      setProfile(data as Profile);
    }
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  useEffect(() => {
    // Small delay lets middleware finish refreshing the session first
    const timer = setTimeout(() => {
      supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        }
        setLoading(false);
      });
    }, 100);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
