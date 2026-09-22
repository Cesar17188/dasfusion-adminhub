import { Injectable, computed, inject, signal } from '@angular/core';
import { AdminUser, CreateAdminDto } from '../models/user-management.model';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

const STORAGE_KEY_ADMINS = 'df_admin_users_list';

const INITIAL_ADMINS: AdminUser[] = [];

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly notificationService = inject(NotificationService);

  readonly admins = signal<AdminUser[]>(this.loadStoredAdmins());
  readonly searchQuery = signal<string>('');
  readonly selectedAdminId = signal<string | null>(null);

  readonly filteredAdmins = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.admins().filter(u => 
      !q ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.professionalTitle.toLowerCase().includes(q)
    );
  });

  readonly totalAdmins = computed(() => this.admins().length);
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
      const { data } = await client
        .from(this.supabaseService.config().tableNameProfiles || 'profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (data) {
        const fromDb: AdminUser[] = data.map(p => {
          const existing = this.admins().find(a => a.id === p.id || a.email === p.email);
          return {
            id: p.id,
            fullName: p.full_name || p.email?.split('@')[0] || 'Administrador',
            email: p.email || existing?.email || 'admin@dasfusion.io',
            professionalTitle: p.professional_title || existing?.professionalTitle || 'Administrador del Sistema',
            role: 'admin',
            avatarUrl: p.avatar_url || existing?.avatarUrl,
            status: existing?.status || 'active',
            provisionalPassword: existing?.provisionalPassword,
            createdAt: p.created_at || new Date().toISOString(),
            lastLogin: existing?.lastLogin
          };
        });

        // Retain local-only admins that might not have synced to profiles yet
        const dbIds = new Set(data.map(p => p.id));
        const dbEmails = new Set(data.map(p => (p.email || '').toLowerCase()));
        const localOnly = this.admins().filter(a => !dbIds.has(a.id) && !dbEmails.has((a.email || '').toLowerCase()));

        this.saveAdmins([...fromDb, ...localOnly]);
      }
    } catch (e) {
      console.warn('Could not sync admins from Supabase:', e);
    }
  }

  async createAdmin(dto: CreateAdminDto): Promise<{ success: boolean; admin?: AdminUser; message?: string }> {
    const tempId = 'admin-' + Date.now().toString(36);
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
              role: 'admin'
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
              professional_title: dto.professionalTitle || 'Administrador del Sistema',
              role: 'admin'
            }
          ]);
        } catch {
          // ignore
        }
      } catch (err: any) {
        console.warn('Could not register in Supabase Auth immediately, creating local admin profile:', err);
      }
    }

    const newAdmin: AdminUser = {
      id: createdId,
      fullName: dto.fullName,
      email: dto.email,
      professionalTitle: dto.professionalTitle || 'Administrador del Sistema',
      role: 'admin',
      provisionalPassword: dto.password,
      status: 'provisional_password',
      createdAt: new Date().toISOString()
    };

    const updated = [newAdmin, ...this.admins()];
    this.saveAdmins(updated);
    this.notificationService.success('Administrador Creado', `Usuario ${dto.fullName} registrado con clave provisional.`);

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
    if (client && !id.startsWith('admin-')) {
      const dbUpdates: any = {};
      if (updates.fullName) dbUpdates.full_name = updates.fullName;
      if (updates.professionalTitle) dbUpdates.professional_title = updates.professionalTitle;
      if (updates.email) dbUpdates.email = updates.email;
      
      try {
        await client.from(this.supabaseService.config().tableNameProfiles || 'profiles')
          .update(dbUpdates)
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    this.notificationService.info('Perfil Actualizado', 'Los datos del administrador fueron guardados.');
  }

  async resetPassword(adminId: string, newPassword: string): Promise<boolean> {
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

    this.notificationService.success('Clave Reasignada', `Se asignó una nueva contraseña provisional.`);
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
    if (client && !id.startsWith('admin-')) {
      try {
        await client.from(this.supabaseService.config().tableNameProfiles || 'profiles')
          .delete()
          .eq('id', id);
      } catch {
        // ignore
      }
    }

    this.notificationService.warning('Acceso Revocado', 'El usuario administrador fue eliminado del sistema.');
  }
}
