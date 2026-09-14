export type UserRole = 'admin' | 'client' | 'developer';

export interface UserProfile {
  id: string;
  fullName: string;
  professionalTitle?: string;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt?: string;
}

export interface SupabaseProfileDb {
  id: string;
  full_name: string | null;
  professional_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: UserRole | null;
  created_at: string | null;
}
