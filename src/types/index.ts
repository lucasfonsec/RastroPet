export interface Profile {
  id: string;
  role: 'admin' | 'user';
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: string;
  breed: string | null;
  color: string | null;
  weight: number | null;
  birth_date: string | null;
  microchip: string | null;
  features: string | null;
  image_url: string | null;
  status: 'safe' | 'lost';
  created_at: string;
}

export interface LostAlert {
  id: string;
  pet_id: string;
  user_id: string;
  last_seen_location: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  status: 'active' | 'resolved';
  created_at: string;
}

export interface Camera {
  id: string;
  admin_id: string;
  name: string;
  status: 'online' | 'offline';
  street: string;
  number: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface UserState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
}
