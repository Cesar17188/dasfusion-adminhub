import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage],
  template: `
    <div class="login-wrapper">
      <!-- Background Ambient Glows -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>
      <div class="ambient-grid"></div>

      <!-- Main Container -->
      <div class="login-card-container">
        <!-- Brand Header -->
        <div class="brand-header">
          <div class="brand-badge-row">
            <span class="df-pill df-pill-primary">ACCESO EXCLUSIVO ADMIN</span>
            <span class="status-indicator-pill" [class.connected]="supabaseService.isConnected()">
              <span class="dot"></span>
              {{ supabaseService.isConnected() ? 'Supabase Online' : 'Modo Seguro Activo' }}
            </span>
          </div>

          <div class="logo-box">
            <img 
              ngSrc="https://whlxncobakktxghxdyfw.supabase.co/storage/v1/object/public/general/logoDasfusionDegradado.webp" 
              alt="DASFusion Logo" 
              class="login-logo-img" 
              width="54"
              height="54"
              priority
            />
          </div>

          <h1 class="headline-md login-title">
            DAS<span class="highlight">FUSION</span> ADMIN
          </h1>
          <p class="body-sm login-subtitle">
            Consola administrativa para usuarios con rol <strong>admin</strong> en profiles
          </p>
        </div>

        <!-- Error Alert -->
        @if (authService.errorMessage()) {
          <div class="error-alert animate-fade">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ authService.errorMessage() }}</span>
          </div>
        }

        <!-- Login Form -->
        <form (ngSubmit)="handleLogin()" class="login-form">
          <div class="form-group">
            <label class="df-label">Correo Electrónico de Administrador</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input 
                type="email" 
                class="df-input login-input" 
                [(ngModel)]="email" 
                name="email" 
                required 
                autocomplete="email"
                placeholder="admin@dasfusion.io"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label class="df-label">Contraseña</label>
              <a routerLink="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="input-with-icon">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                class="df-input login-input" 
                [(ngModel)]="password" 
                name="password" 
                required 
                autocomplete="current-password"
                placeholder="••••••••••••"
              />
              <button 
                type="button" 
                class="eye-btn" 
                (click)="showPassword.set(!showPassword())"
                tabindex="-1"
              >
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                }
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="df-btn df-btn-primary btn-submit-login" 
            [disabled]="authService.isLoading()"
          >
            @if (authService.isLoading()) {
              <span class="spinner"></span>
              <span>Validando credenciales y rol...</span>
            } @else {
              <span>Ingresar como Administrador</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
          </button>
        </form>

        <!-- Footer Info -->
        <div class="login-footer">
          <span class="caption">DASFusion System v2.0 • Sincronización Supabase RLS</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0b0d11;
      position: relative;
      overflow: hidden;
      padding: 1.5rem;
      font-family: inherit;
    }

    /* Ambient Effects */
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      pointer-events: none;
      opacity: 0.45;
    }

    .glow-1 {
      top: -10%;
      left: 20%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(174, 199, 247, 0.25) 0%, rgba(27, 54, 93, 0.05) 70%);
    }

    .glow-2 {
      bottom: -15%;
      right: 15%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(107, 227, 161, 0.15) 0%, rgba(0, 57, 28, 0.03) 70%);
    }

    .ambient-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
      opacity: 0.7;
    }

    /* Card Container */
    .login-card-container {
      width: 100%;
      max-width: 460px;
      background: rgba(18, 20, 24, 0.85);
      border: 1px solid rgba(174, 199, 247, 0.15);
      border-radius: var(--df-radius-lg);
      padding: 2.5rem 2rem;
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(174, 199, 247, 0.05);
      position: relative;
      z-index: 10;
      animation: floatUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes floatUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .brand-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.75rem;
    }

    .brand-badge-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .status-indicator-pill {
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.55rem;
      border-radius: var(--df-radius-full);
      background: rgba(255, 255, 255, 0.06);
      color: var(--df-text-muted);
    }

    .status-indicator-pill.connected {
      color: var(--df-success);
      background: rgba(107, 227, 161, 0.1);
    }

    .status-indicator-pill .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--df-text-muted);
    }

    .status-indicator-pill.connected .dot {
      background: var(--df-success);
      box-shadow: 0 0 6px var(--df-success);
    }

    .logo-box {
      width: 54px;
      height: 54px;
      border-radius: var(--df-radius-default);
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(174, 199, 247, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.85rem;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
      padding: 6px;
    }

    .login-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }

    .login-title {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--df-text-primary);
      margin-bottom: 0.25rem;
    }

    .login-title .highlight {
      color: var(--df-primary);
    }

    .login-subtitle {
      color: var(--df-text-secondary);
      font-size: 0.85rem;
    }

    /* Error Alert */
    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(255, 180, 171, 0.1);
      border: 1px solid rgba(255, 180, 171, 0.3);
      color: var(--df-error);
      padding: 0.75rem 1rem;
      border-radius: var(--df-radius-default);
      font-size: 0.825rem;
      margin-bottom: 1.25rem;
    }

    .animate-fade {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Form Styles */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--df-primary);
      text-decoration: none;
      transition: all var(--df-transition-fast);
      cursor: pointer;
    }

    .forgot-link:hover {
      text-decoration: underline;
      opacity: 0.85;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--df-text-muted);
      pointer-events: none;
    }

    .login-input {
      padding-left: 2.75rem;
      padding-right: 2.5rem;
      height: 46px;
      font-size: 0.9rem;
      background: rgba(25, 28, 33, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all var(--df-transition-fast);
    }

    .login-input:focus {
      border-color: var(--df-primary);
      box-shadow: 0 0 0 3px rgba(174, 199, 247, 0.2);
      background: rgba(30, 34, 40, 0.95);
    }

    .eye-btn {
      position: absolute;
      right: 0.85rem;
      background: none;
      border: none;
      color: var(--df-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
    }

    .eye-btn:hover {
      color: var(--df-text-primary);
    }

    .btn-submit-login {
      height: 46px;
      margin-top: 0.5rem;
      font-size: 0.925rem;
      font-weight: 700;
      justify-content: center;
      gap: 0.65rem;
      box-shadow: 0 4px 14px rgba(174, 199, 247, 0.2);
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .login-footer {
      margin-top: 1.75rem;
      text-align: center;
      color: var(--df-text-muted);
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1rem;
    }
  `]
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  readonly supabaseService = inject(SupabaseService);

  email = '';
  password = '';
  readonly showPassword = signal<boolean>(false);

  async handleLogin() {
    if (!this.email || !this.password) {
      this.authService.errorMessage.set('Por favor ingresa tu correo y contraseña.');
      return;
    }

    await this.authService.login(this.email, this.password);
  }
}
