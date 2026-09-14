import { UserRole } from './profile.model';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  professionalTitle: string;
  role: UserRole;
  avatarUrl?: string;
  provisionalPassword?: string;
  status: 'active' | 'provisional_password' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface CreateAdminDto {
  fullName: string;
  email: string;
  password: string;
  professionalTitle?: string;
  role?: UserRole;
}
