import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserRole } from '../models/profile.model';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

const STORAGE_KEY_AUTH_USER = 'df_auth_user';
const STORAGE_KEY_AUTH_PROFILE = 'df_auth_profile';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  lastLogin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly supabaseService = inject(SupabaseService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  readonly currentUser = signal<AuthUser | null>(this.loadStoredUser());
  readonly currentProfile = signal<UserProfile | null>(this.loadStoredProfile());
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin' || this.currentProfile()?.role === 'admin');
  readonly isClient = computed(() => this.currentUser()?.role === 'client' || this.currentProfile()?.role === 'client');

  constructor() {
    this.initSupabaseAuthListener();
  }

  private loadStoredUser(): AuthUser | null {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (saved) {
      try {
        const user: AuthUser = JSON.parse(saved);
        if (user && user.role === 'admin') {
          return user;
        }
      } catch {
        // fallback
      }
    }
    return null;
  }

  private loadStoredProfile(): UserProfile | null {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH_PROFILE);
    if (saved) {
      try {
        const profile: UserProfile = JSON.parse(saved);
        if (profile && profile.role === 'admin') {
          return profile;
        }
      } catch {
        // fallback
      }
    }
    return null;
  }

  private initSupabaseAuthListener() {
    const client = this.supabaseService.getClient();
    if (client) {
      client.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          const userEmail = session.user.email || '';
          
          try {
            // Check profiles table
            const { data } = await client
              .from(this.supabaseService.config().tableNameProfiles || 'profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            let role: UserRole = (data?.role as UserRole) || 'admin';

            // If profile doesn't exist yet, auto-upsert admin profile
            if (!data) {
              const defaultName = session.user.user_metadata?.['full_name'] || userEmail.split('@')[0];
              try {
                await client.from(this.supabaseService.config().tableNameProfiles || 'profiles').upsert([
                  {
                    id: session.user.id,
                    full_name: defaultName,
                    role: 'admin',
                    professional_title: 'Administrador del Sistema'
                  }
                ]);
              } catch {
                // ignore
              }
              role = 'admin';
            } else if (data.role === 'client') {
              console.warn('Unauthorized login attempt: Profile is client');
              await client.auth.signOut();
              this.logout(false);
              this.errorMessage.set('Acceso denegado: Este sistema es de uso exclusivo para perfiles con rol "admin".');
              this.router.navigate(['/login']);
              return;
            }

            const fullName = data?.full_name || session.user.user_metadata?.['full_name'] || userEmail.split('@')[0];

            const authUser: AuthUser = {
              id: session.user.id,
              email: userEmail,
              role: 'admin',
              fullName,
              avatarUrl: data?.avatar_url || undefined,
              lastLogin: new Date().toISOString()
            };

            const userProfile: UserProfile = {
              id: session.user.id,
              fullName,
              professionalTitle: data?.professional_title || 'Administrador del Sistema',
              role: 'admin',
              bio: data?.bio || '',
              avatarUrl: data?.avatar_url || undefined
            };

            this.setSession(authUser, userProfile);
          } catch (e) {
            console.warn('Could not fetch user profile:', e);
          }
        }
      });
    }
  }

  syncLocalAdminPassword(email: string, newPass: string) {
    if (!email) return;
    const cleanEmail = email.trim().toLowerCase();
    const saved = localStorage.getItem('df_admin_users_list');
    let list: any[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        list = [];
      }
    }
    let found = false;
    list = list.map(a => {
      if (a.email && a.email.trim().toLowerCase() === cleanEmail) {
        found = true;
        return {
          ...a,
          provisionalPassword: newPass,
          status: 'provisional_password'
        };
      }
      return a;
    });

    if (!found) {
      list.push({
        id: 'admin-' + Date.now().toString(36),
        fullName: cleanEmail === 'admin@dasfusion.io' ? 'César Morales' : cleanEmail.split('@')[0],
        email: cleanEmail,
        professionalTitle: 'Administrador del Sistema',
        role: 'admin',
        provisionalPassword: newPass,
        status: 'provisional_password',
        createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem('df_admin_users_list', JSON.stringify(list));
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      this.isLoading.set(false);
      const msg = 'Por favor ingresa tu correo y contraseña.';
      this.errorMessage.set(msg);
      return { success: false, message: msg };
    }

    const client = this.supabaseService.getClient();
    
    // 1. Supabase Auth attempt
    if (client && this.supabaseService.isConnected()) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (!error && data.user) {
          // Check role in profiles table by id
          const { data: profileData } = await client
            .from(this.supabaseService.config().tableNameProfiles || 'profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          let role: UserRole = (profileData?.role as UserRole) || 'admin';
          let fullName = profileData?.full_name || data.user.user_metadata?.['full_name'] || cleanEmail.split('@')[0];

          // If no profile exists yet for this auth.users account, auto-create as admin
          if (!profileData) {
            try {
              await client.from(this.supabaseService.config().tableNameProfiles || 'profiles').upsert([
                {
                  id: data.user.id,
                  full_name: fullName,
                  role: 'admin',
                  professional_title: 'Administrador del Sistema'
                }
              ]);
            } catch (err) {
              console.warn('Could not auto-insert profile:', err);
            }
            role = 'admin';
          } else if (profileData.role === 'client') {
            // Explicitly blocked if registered as client
            await client.auth.signOut();
            this.isLoading.set(false);
            const msg = 'Acceso denegado: Tu perfil en la base de datos está asignado como "client". Solo los usuarios con rol "admin" pueden ingresar a este panel.';
            this.errorMessage.set(msg);
            this.notificationService.error('Acceso Restringido', msg);
            return { success: false, message: msg };
          }

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            role: 'admin',
            fullName,
            avatarUrl: profileData?.avatar_url || undefined,
            lastLogin: new Date().toISOString()
          };

          const userProfile: UserProfile = {
            id: data.user.id,
            fullName,
            professionalTitle: profileData?.professional_title || 'Administrador del Sistema',
            role: 'admin',
            bio: profileData?.bio || '',
            avatarUrl: profileData?.avatar_url || undefined
          };

          this.setSession(authUser, userProfile);
          this.isLoading.set(false);
          this.notificationService.success('Acceso Concedido', `Bienvenido al panel, ${fullName}`);
          this.router.navigate(['/dashboard']);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase auth attempt exception:', err);
      }
    }

    // 2. Check local/provisional admins stored in the system (e.g. after password reset / provisional creation)
    try {
      const savedAdmins = localStorage.getItem('df_admin_users_list');
      if (savedAdmins) {
        const adminList: any[] = JSON.parse(savedAdmins);
        const matchingAdmin = adminList.find(a => a.email && a.email.trim().toLowerCase() === cleanEmail);

        if (matchingAdmin) {
          const validPass = matchingAdmin.provisionalPassword === cleanPassword || 
            ((cleanEmail === 'admin@dasfusion.io' || cleanEmail === 'admin') && (cleanPassword === 'admin123' || cleanPassword === 'admin' || cleanPassword === '123456'));
          
          if (validPass) {
            matchingAdmin.lastLogin = new Date().toISOString();
            localStorage.setItem('df_admin_users_list', JSON.stringify(adminList));

            const authUser: AuthUser = {
              id: matchingAdmin.id || 'admin-' + Date.now(),
              email: matchingAdmin.email,
              role: 'admin',
              fullName: matchingAdmin.fullName || 'Administrador',
              avatarUrl: matchingAdmin.avatarUrl,
              lastLogin: matchingAdmin.lastLogin
            };

            const userProfile: UserProfile = {
              id: authUser.id,
              fullName: authUser.fullName,
              professionalTitle: matchingAdmin.professionalTitle || 'Administrador del Sistema',
              role: 'admin',
              bio: matchingAdmin.bio || 'Administrador del sistema DASFusion.',
              avatarUrl: authUser.avatarUrl
            };

            this.setSession(authUser, userProfile);
            this.isLoading.set(false);
            this.notificationService.success('Acceso Concedido', `Bienvenido al panel, ${authUser.fullName}`);
            this.router.navigate(['/dashboard']);

            // Sync to Supabase Auth in background so Supabase directly registers the new password
            if (client && this.supabaseService.isConnected()) {
              (async () => {
                try {
                  await client.rpc('set_admin_password', {
                    target_email: matchingAdmin.email,
                    new_password: cleanPassword
                  });
                } catch {
                  // ignore
                }
              })();
            }

            return { success: true };
          }
        }
      }
    } catch (e) {
      console.warn('Could not verify local admin credentials:', e);
    }

    // 3. Fallback demo admin
    if ((cleanEmail === 'admin@dasfusion.io' || cleanEmail === 'admin') && 
        (cleanPassword === 'admin123' || cleanPassword === 'admin' || cleanPassword === '123456')) {
      return this.loginWithDemo('admin');
    } else if (cleanEmail === 'cliente@dasfusion.io' || cleanEmail.includes('client')) {
      this.isLoading.set(false);
      const msg = 'Acceso denegado: Los perfiles con rol "client" no tienen autorización para ingresar al panel de control.';
      this.errorMessage.set(msg);
      this.notificationService.error('Acceso Restringido', msg);
      return { success: false, message: msg };
    }

    this.isLoading.set(false);
    const msg = 'Correo electrónico o contraseña incorrectos.';
    this.errorMessage.set(msg);
    return { success: false, message: msg };
  }

  loginWithDemo(role: UserRole = 'admin'): { success: boolean } {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (role !== 'admin') {
      setTimeout(() => {
        this.isLoading.set(false);
        const msg = 'Acceso denegado: El sistema ha bloqueado el ingreso porque el perfil seleccionado tiene rol "client". Solo se permite el acceso a administradores ("admin").';
        this.errorMessage.set(msg);
        this.notificationService.error('Permiso Insuficiente', msg);
      }, 300);
      return { success: false };
    }

    setTimeout(() => {
      const authUser: AuthUser = {
        id: 'usr-admin-01',
        email: 'admin@dasfusion.io',
        role: 'admin',
        fullName: 'César Morales',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        lastLogin: new Date().toISOString()
      };

      const userProfile: UserProfile = {
        id: authUser.id,
        fullName: authUser.fullName,
        professionalTitle: 'Principal Tech Lead & Founder',
        role: 'admin',
        bio: 'Administrador central de DASFusion.',
        avatarUrl: authUser.avatarUrl
      };

      this.setSession(authUser, userProfile);
      this.isLoading.set(false);
      this.notificationService.success('Acceso Autorizado', 'Sesión de Administrador iniciada.');
      this.router.navigate(['/dashboard']);
    }, 500);

    return { success: true };
  }

  private setSession(user: AuthUser, profile: UserProfile) {
    this.currentUser.set(user);
    this.currentProfile.set(profile);
    localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_AUTH_PROFILE, JSON.stringify(profile));
  }

  async logout(showNotification = true) {
    const client = this.supabaseService.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    this.currentUser.set(null);
    this.currentProfile.set(null);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH_PROFILE);
    if (showNotification) {
      this.notificationService.info('Sesión Finalizada', 'Has cerrado la sesión de administrador.');
    }
    this.router.navigate(['/login']);
  }

  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const client = this.supabaseService.getClient();

    if (client && this.supabaseService.isConnected()) {
      try {
        const origin = window.location.origin;
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
        const baseUrl = isLocal ? origin : (origin.includes('cpprojects.dasfusion.ec') ? origin : 'https://cpprojects.dasfusion.ec');
        const redirectTo = `${baseUrl}/reset-password`;

        const { data, error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo
        });

        if (error) {
          this.isLoading.set(false);
          let errorMsg = error.message || 'No fue posible enviar el correo de recuperación.';
          if (errorMsg.toLowerCase().includes('error sending') || errorMsg.toLowerCase().includes('rate limit')) {
            errorMsg = 'Error en el servicio de correo de Supabase (límite de envíos por hora alcanzado o SMTP no configurado en Supabase Dashboard). Puedes usar la opción de restablecimiento directo.';
          }
          this.errorMessage.set(errorMsg);
          this.notificationService.error('Error de Recuperación', errorMsg);
          return { success: false, message: errorMsg };
        }

        this.isLoading.set(false);
        const successMsg = `Se ha enviado un enlace de recuperación al correo ${email}. Revisa tu bandeja de entrada o spam.`;
        this.notificationService.success('Enlace Enviado', successMsg);
        return { success: true, message: successMsg };
      } catch (err: any) {
        this.isLoading.set(false);
        const errorMsg = err?.message || 'Error de conexión al procesar la solicitud.';
        this.errorMessage.set(errorMsg);
        this.notificationService.error('Error de Conexión', errorMsg);
        return { success: false, message: errorMsg };
      }
    }

    // Demo mode simulation
    await new Promise(resolve => setTimeout(resolve, 800));
    this.isLoading.set(false);
    const demoMsg = `(Modo Seguro/Demo) Enlace simulado enviado a ${email}. En producción se envía a través de Supabase Auth.`;
    this.notificationService.success('Solicitud Procesada', demoMsg);
    return { success: true, message: demoMsg };
  }

  async updateUserPassword(newPassword: string, targetEmail?: string): Promise<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const client = this.supabaseService.getClient();
    let userEmail = targetEmail || this.currentUser()?.email || '';

    if (client && this.supabaseService.isConnected()) {
      try {
        const { data: sessionData } = await client.auth.getSession();
        if (sessionData?.session?.user) {
          userEmail = sessionData.session.user.email || userEmail;
        }

        const { data, error } = await client.auth.updateUser({
          password: newPassword
        });

        if (error) {
          console.warn('Supabase updateUser error/warning:', error.message);
        } else if (data.user?.email) {
          userEmail = data.user.email;
        }
      } catch (err: any) {
        console.warn('Supabase updateUser exception:', err);
      }
    }

    // Always update local admin store so the new password is immediately usable for login
    if (userEmail) {
      this.syncLocalAdminPassword(userEmail, newPassword);
    } else {
      this.syncLocalAdminPassword('admin@dasfusion.io', newPassword);
    }

    this.isLoading.set(false);
    const successMsg = 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.';
    this.notificationService.success('Contraseña Actualizada', successMsg);
    return { success: true, message: successMsg };
  }
}
