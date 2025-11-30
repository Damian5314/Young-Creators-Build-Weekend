import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/shared/types';

interface RestaurantData {
  name: string;
  kvkNumber: string;
  address: string;
  city: string;
  cuisineTypes: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string, role?: 'USER' | 'OWNER', restaurantData?: RestaurantData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    role: 'USER' | 'OWNER' = 'USER',
    restaurantData?: RestaurantData
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          role: role
        }
      }
    });

    // If signup successful and user is auto-confirmed, update state
    if (!error && data.user && data.session) {
      setUser(data.user);
      setSession(data.session);

      // Wait a bit for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update profile with role, KVK number, and city (for restaurant owners)
      await supabase
        .from('profiles')
        .update({
          role: role,
          ...(restaurantData?.kvkNumber && { kvk_number: restaurantData.kvkNumber }),
          ...(restaurantData?.city && { city: restaurantData.city })
        })
        .eq('id', data.user.id);

      // If restaurant owner, create the restaurant
      if (role === 'OWNER' && restaurantData) {
        // Get coordinates for the city (simplified - using Amsterdam as default for Dutch cities)
        const cityCoordinates: Record<string, { lat: number; lng: number }> = {
          'amsterdam': { lat: 52.3676, lng: 4.9041 },
          'rotterdam': { lat: 51.9244, lng: 4.4777 },
          'den haag': { lat: 52.0705, lng: 4.3007 },
          'utrecht': { lat: 52.0907, lng: 5.1214 },
          'eindhoven': { lat: 51.4416, lng: 5.4697 },
          'tilburg': { lat: 51.5555, lng: 5.0913 },
          'groningen': { lat: 53.2194, lng: 6.5665 },
          'almere': { lat: 52.3508, lng: 5.2647 },
          'breda': { lat: 51.5719, lng: 4.7683 },
          'nijmegen': { lat: 51.8426, lng: 5.8546 },
        };

        const cityLower = restaurantData.city.toLowerCase();
        const coords = cityCoordinates[cityLower] || { lat: 52.3676, lng: 4.9041 }; // Default to Amsterdam

        const { error: restaurantError } = await supabase
          .from('restaurants')
          .insert({
            name: restaurantData.name,
            address: restaurantData.address,
            city: restaurantData.city,
            cuisine_types: restaurantData.cuisineTypes,
            latitude: coords.lat,
            longitude: coords.lng,
            owner_id: data.user.id,
            description: `Welkom bij ${restaurantData.name}!`,
          });

        if (restaurantError) {
          console.error('Error creating restaurant:', restaurantError);
        }
      }

      await fetchProfile(data.user.id);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      getToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
