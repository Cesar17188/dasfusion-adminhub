import { Injectable, computed, inject, signal } from '@angular/core';
import { AdminUser, CreateAdminDto } from '../models/user-management.model';
import { UserRole } from '../models/profile.model';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

const STORAGE_KEY_ADMINS = 'df_admin_users_list';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly notificationService = inject(NotificationService);

  readonly admins = signal<AdminUser[]>(this.loadStoredAdmins());
  readonly searchQuery = signal<string>('');
  readonly roleFilter = signal<UserRole | 'all'>('all');
  readonly selectedAdminId = signal<string | null>(null);

  readonly filteredAdmins = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const role = this.roleFilter();

    return this.admins().filter(u => {
      const matchesQuery = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.professionalTitle.toLowerCase().includes(q);

      const matchesRole = role === 'all' || u.role === role;

      return matchesQuery && matchesRole;
    });
  });

  readonly totalUsers = computed(() => this.admins().length);
  readonly totalAdmins = computed(() => this.admins().filter(u => u.role === 'admin').length);
  readonly totalClients = computed(() => this.admins().filter(u => u.role === 'client').length);
  readonly activeAdmins = computed(() => this.admins().filter(u => u.status === 'active').length);
  readonly provisionalAdmins = computed(() => this.admins().filter(u => u.status === 'provisional_password').length);

  constructor() {
    this.syncWithSupabase();
  }

  private loadStoredAdmins(): AdminUser[] {
    const saved = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (saved) {
      try {
        const parsed: AdminUser[] = JSON.parse(saved);
        // Clean out legacy mock data with usr-admin-0x ids
        const cleaned = parsed.filter(a => !a.id.startsWith('usr-admin-0'));
        return cleaned;
      } catch {
        // fallback
      }
    }
    return [];
  }

  private saveAdmins(list: AdminUser[]) {
    this.admins.set(list);
    localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(list));
  }

  generateProvisionalPassword(): string {
    const adjectives = ['Delta', 'Cyber', 'Nexus', 'Fusion', 'Vector', 'Quantum', 'Admin'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['#', '$', '!', '@'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    return `${adj}${sym}${num}`;
  }

  async syncWithSupabase() {
    const client = this.supabaseService.getClient();
    if (!client) return;

    try {
      const { data, error } = await client
        .from(this.supabaseService.config().tableNameProfiles || 'profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching profiles from Supabase:', error);
        return;
      }

      if (data) {
        const fromDb: AdminUser[] = data.map(p => {
          const existing = this.admins().find(a => a.id === p.id || a.email === p.email);
          const rawRole = (p.role || 'client').toLowerCase();
          const mappedRole: UserRole = rawRole === 'admin' ? 'admin' : (rawRole === 'developer' ? 'developer' : 'client');

          return {
            id: p.id,
            fullName: p.full_name || p.email?.split('@')[0] || 'Usuario',
            email: p.email || existing?.email || 'usuario@dasfusion.io',
            professionalTitle: p.professional_title || existing?.professionalTitle || (mappedRole === 'admin' ? 'Administrador del Sistema' : 'Cliente / Usuario'),
            role: mappedRole,
            avatarUrl: p.avatar_url || existing?.avatarUrl,
            status: existing?.status || 'active',
            provisionalPassword: existing?.provisionalPassword,
            createdAt: p.created_at || new Date().toISOString(),
            lastLogin: existing?.lastLogin
          };
        });

        // Retain local-only users that might not have synced to profiles yet
        const dbIds = new Set(data.map(p => p.id));
        const dbEmails = new Set(data.map(p => (p.email || '').toLowerCase()));
        const localOnly = this.admins().filter(a => !dbIds.has(a.id) && !dbEmails.has((a.email || '').toLowerCase()));

        this.saveAdmins([...fromDb, ...localOnly]);
      }
    } catch (e) {
      console.warn('Could not sync users from Supabase:', e);
    }
  }

  async updateUserRole(id: string, newRole: UserRole): Promise<boolean> {
    const target = this.admins().find(a => a.id === id);
    if (!target) {
      this.notificationService.error('Error', 'Usuario no encontrado en el sistema.');
      return false;
    }

    if (target.email === 'admin@dasfusion.io' && newRole !== 'admin') {
      this.notificationService.error('Acción Denegada', 'No puedes quitar el rol de administrador a la cuenta principal del sistema.');
      return false;
    }

    // Check if we are demoting the only admin
    if (target.role === 'admin' && newRole !== 'admin' && this.totalAdmins() <= 1) {
      this.notificationService.warning('Advertencia de Seguridad', 'Debe existir al menos un usuario con rol de Administrador.');
      return false;
    }

    const previousRole = target.role;
    const defaultTitle = newRole === 'admin' 
      ? (target.professionalTitle === 'Cliente / Usuario' ? 'Administrador del Sistema' : target.professionalTitle)
      : (target.professionalTitle === 'Administrador del Sistema' ? 'Cliente / Usuario' : target.professionalTitle);

    const updated = this.admins().map(a => {
      if (a.id === id) {
        return { 
          ...a, 
          role: newRole,
          professionalTitle: defaultTitle
        };
      }
      return a;
    });

    this.saveAdmins(updated);

    // Sync to Supabase profiles
    const client = this.supabaseService.getClient();
    if (client && !id.startsWith('admin-')) {
      try {
        const { error } = await client
          .from(this.supabaseService.config().tableNameProfiles || 'profiles')
          .update({ 
            role: newRole,
            professional_title: defaultTitle
          })
          .eq('id', id);

        if (error) {
          console.warn('Error updating role in Supabase profiles:', error);
        }
      } catch (err) {
        console.warn('Supabase profile role update exception:', err);
      }
    }

    const roleLabel = newRole === 'admin' ? 'Administrador (admin)' : (newRole === 'client' ? 'Cliente (client)' : 'Desarrollador (developer)');
    this.notificationService.success(
      'Rol Actualizado', 
      `El usuario "${target.fullName}" ahora tiene rol de ${roleLabel}.`
    );

    return true;
  }

  async createAdmin(dto: CreateAdminDto): Promise<{ success: boolean; admin?: AdminUser; message?: string }> {
    const targetRole = dto.role || 'admin';
    const tempId = 'usr-' + Date.now().toString(36);
    const client = this.supabaseService.getClient();

    let createdId = tempId;

    // 1. Try Supabase Auth Sign Up if online
    if (client && this.supabaseService.isConnected()) {
      try {
        const { data: authData } = await client.auth.signUp({
          email: dto.email,
          password: dto.password,
          options: {
            data: {
              full_name: dto.fullName,
              role: targetRole
            }
          }
        });

        if (authData?.user) {
          createdId = authData.user.id;
        }

        // 2. Insert into public.profiles
        try {
          await client.from(this.supabaseService.config().tableNameProfiles || 'profiles').upsert([
            {
              id: createdId,
              email: dto.email,
              full_name: dto.fullName,
              professional_title: dto.professionalTitle || (targetRole === 'admin' ? 'Administrador del Sistema' : 'Cliente / Usuario'),
              role: targetRole
            }
          ]);
        } catch {
          // ignore
        }
      } catch (err: any) {
        console.warn('Could not register in Supabase Auth immediately, creating local user profile:', err);
      }
    }

    const newAdmin: AdminUser = {
      id: createdId,
      fullName: dto.fullName,
      email: dto.email,
      professionalTitle: dto.professionalTitle || (targetRole === 'admin' ? 'Administrador del Sistema' : 'Cliente / Usuario'),
      role: targetRole,
      provisionalPassword: dto.password,
      status: 'provisional_password',
      createdAt: new Date().toISOString()
    };

    const updated = [newAdmin, ...this.admins()];
    this.saveAdmins(updated);
    
    const roleLabel = targetRole === 'admin' ? 'Administrador' : 'Cliente';
    this.notificationService.success(
      'Usuario Registrado', 
      `Usuario ${dto.fullName} registrado como ${roleLabel} con clave provisional.`
    );

    return { success: true, admin: newAdmin };
  }

  async updateAdmin(id: string, updates: Partial<AdminUser>) {
    const updated = this.admins().map(a => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      return a;
    });
    this.saveAdmins(updated);

    // Sync to Supabase profiles
    const client = this.supabaseService.getClient();
    if (client && !id.startsWith('admin-') && !id.startsWith('usr-')) {
      const dbUpdates: any = {};
      if (updates.fullName) dbUpdates.full_name = updates.fullName;
      if (updates.professionalTitle) dbUpdates.professional_title = updates.professionalTitle;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.role = updates.role;
      
      try {
        await client.from(this.supabaseService.config().tableNameProfiles || 'profiles')
          .update(dbUpdates)
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    this.notificationService.info('Perfil Actualizado', 'Los datos del usuario fueron guardados.');
  }

  async resetPassword(adminId: string, newPassword: string): Promise<boolean> {
    const admin = this.admins().find(a => a.id === adminId);
    const updated = this.admins().map(a => {
      if (a.id === adminId) {
        return { 
          ...a, 
          provisionalPassword: newPassword,
          status: 'provisional_password' as const
        };
      }
      return a;
    });
    this.saveAdmins(updated);

    // Sync to Supabase Auth via RPC or Admin API
    const client = this.supabaseService.getClient();
    if (client && admin && this.supabaseService.isConnected()) {
      try {
        // Attempt database RPC to update auth.users encrypted password directly in Supabase
        await client.rpc('set_admin_password', {
          target_email: admin.email,
          new_password: newPassword
        });
      } catch (e) {
        console.warn('Supabase set_admin_password RPC notice:', e);
      }
    }

    this.notificationService.success('Clave Reasignada', `Se asignó una nueva contraseña provisional sincronizada con el sistema.`);
    return true;
  }

  async deleteAdmin(id: string) {
    const target = this.admins().find(a => a.id === id);
    if (target?.email === 'admin@dasfusion.io') {
      this.notificationService.error('Acción Bloqueada', 'No puedes eliminar al administrador principal del sistema.');
      return;
    }

    const updated = this.admins().filter(a => a.id !== id);
    this.saveAdmins(updated);

    // Remove from Supabase profiles
    const client = this.supabaseService.getClient();
    if (client && !id.startsWith('admin-') && !id.startsWith('usr-')) {
      try {
        await client.from(this.supabaseService.config().tableNameProfiles || 'profiles')
          .delete()
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    this.notificationService.warning('Acceso Revocado', 'El usuario fue eliminado del sistema.');
  }
}

