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

  async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const client = this.supabaseService.getClient();
    
    // 1. Supabase Auth attempt
    if (client && this.supabaseService.isConnected()) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data.user) {
          // Check role in profiles table by id
          const { data: profileData } = await client
            .from(this.supabaseService.config().tableNameProfiles || 'profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          let role: UserRole = (profileData?.role as UserRole) || 'admin';
          let fullName = profileData?.full_name || data.user.user_metadata?.['full_name'] || email.split('@')[0];

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
            email: data.user.email || email,
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
        } else if (error) {
          // Check demo fallback credentials
          if (email === 'admin@dasfusion.io' && (password === 'admin123' || password === 'admin')) {
            return this.loginWithDemo('admin');
          }
          this.isLoading.set(false);
          const errorMsg = error.message?.includes('Failed to fetch') || error.message?.includes('fetch')
            ? `Error de red con Supabase (URL: ${this.supabaseService.config().url}). Verifica tu conexión o el estado del proyecto en Supabase.`
            : (error.message || 'Credenciales no válidas.');
          this.errorMessage.set(errorMsg);
          return { success: false, message: errorMsg };
        }
      } catch (err: any) {
        console.warn('Supabase auth network exception:', err);
        this.isLoading.set(false);
        const errorMsg = err?.message?.includes('Failed to fetch') || err?.message?.includes('fetch')
          ? `No se pudo contactar a Supabase (${this.supabaseService.config().url}). Verifica que la URL en environment.ts sea la correcta.`
          : (err?.message || 'Error de conexión con el servidor.');
        this.errorMessage.set(errorMsg);
        return { success: false, message: errorMsg };
      }
    }

    // 2. Demo mode handler
    if ((email === 'admin@dasfusion.io' || email === 'admin') && (password === 'admin123' || password === 'admin' || password === '123456')) {
      return this.loginWithDemo('admin');
    } else if (email === 'cliente@dasfusion.io' || email.includes('client')) {
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
        const redirectTo = `${window.location.origin}/reset-password`;
        const { data, error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo
        });

        if (error) {
          this.isLoading.set(false);
          const errorMsg = error.message || 'No fue posible enviar el correo de recuperación.';
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

  async updateUserPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const client = this.supabaseService.getClient();

    if (client && this.supabaseService.isConnected()) {
      try {
        const { data, error } = await client.auth.updateUser({
          password: newPassword
        });

        if (error) {
          this.isLoading.set(false);
          const errorMsg = error.message || 'No se pudo actualizar la contraseña.';
          this.errorMessage.set(errorMsg);
          this.notificationService.error('Error al Cambiar Contraseña', errorMsg);
          return { success: false, message: errorMsg };
        }

        this.isLoading.set(false);
        const successMsg = 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tus nuevas credenciales.';
        this.notificationService.success('Contraseña Actualizada', successMsg);
        return { success: true, message: successMsg };
      } catch (err: any) {
        this.isLoading.set(false);
        const errorMsg = err?.message || 'Error de conexión al actualizar la contraseña.';
        this.errorMessage.set(errorMsg);
        this.notificationService.error('Error de Conexión', errorMsg);
        return { success: false, message: errorMsg };
      }
    }

    // Demo mode simulation
    await new Promise(resolve => setTimeout(resolve, 800));
    this.isLoading.set(false);
    const demoMsg = '(Modo Seguro/Demo) Contraseña de administrador actualizada correctamente.';
    this.notificationService.success('Contraseña Actualizada', demoMsg);
    return { success: true, message: demoMsg };
  }
}
