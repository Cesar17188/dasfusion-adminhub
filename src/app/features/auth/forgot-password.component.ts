import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage],
  template: `
    <div class="auth-wrapper">
      <!-- Background Ambient Glows -->
      <div class="ambient-glow glow-1"></div>
      <div class="ambient-glow glow-2"></div>
      <div class="ambient-grid"></div>

      <!-- Main Card Container -->
      <div class="auth-card-container">
        
        <!-- Header Branding -->
        <div class="brand-header">
          <div class="brand-badge-row">
            <span class="df-pill df-pill-primary">RECUPERACIÓN DE ACCESO</span>
            <span class="status-indicator-pill" [class.connected]="supabaseService.isConnected()">
              <span class="dot"></span>
              {{ supabaseService.isConnected() ? 'Supabase Online' : 'Modo Seguro Activo' }}
            </span>
          </div>

          <div class="logo-box">
            <img 
              ngSrc="https://whlxncobakktxghxdyfw.supabase.co/storage/v1/object/public/general/logoDasfusionDegradado.webp" 
              alt="DASFusion Logo" 
              class="auth-logo-img" 
              width="54"
              height="54"
              priority
            />
          </div>

          <h1 class="headline-md auth-title">
            DAS<span class="highlight">FUSION</span> ADMIN
          </h1>
          <p class="body-sm auth-subtitle">
            Recuperación de credenciales para administradores del sistema
          </p>
        </div>

        @if (!emailSent()) {
          <!-- Error Alert -->
          @if (authService.errorMessage()) {
            <div class="error-alert animate-fade">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div class="error-msg-wrapper">
                <span>{{ authService.errorMessage() }}</span>
                @if (email.trim()) {
                  <a [routerLink]="['/reset-password']" [queryParams]="{ email: email.trim() }" class="direct-recovery-btn">
                    🔑 Restablecer contraseña directamente para este correo →
                  </a>
                }
              </div>
            </div>
          }

          <!-- Information notice -->
          <div class="info-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p>
              Ingresa el correo electrónico asociado a tu cuenta de administrador. Te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>
          </div>

          <!-- Request Form -->
          <form (ngSubmit)="handleSendRecovery()" class="auth-form">
            <div class="form-group">
              <label class="df-label">Correo Electrónico de Administrador</label>
              <div class="input-with-icon">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input 
                  type="email" 
                  class="df-input auth-input" 
                  [(ngModel)]="email" 
                  name="email" 
                  required 
                  autocomplete="email"
                  placeholder="admin@dasfusion.io"
                />
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="df-btn df-btn-primary btn-submit" 
              [disabled]="authService.isLoading() || !email.trim()"
            >
              @if (authService.isLoading()) {
                <span class="spinner"></span>
                <span>Enviando enlace seguro...</span>
              } @else {
                <span>Enviar Enlace de Recuperación</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              }
            </button>
          </form>

        } @else {
          <!-- Success State -->
          <div class="success-state animate-fade">
            <div class="success-icon-badge">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>

            <h2 class="success-title">¡Enlace Enviado!</h2>
            <p class="success-desc">
              Hemos enviado las instrucciones para restablecer tu contraseña a:
            </p>
            <div class="target-email-chip">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>{{ email }}</span>
            </div>

            <div class="instructions-box">
              <div class="instruction-item">
                <span class="num">1</span>
                <span>Abre el mensaje recibido y haz clic en <strong>Restablecer Contraseña</strong>.</span>
              </div>
              <div class="instruction-item">
                <span class="num">2</span>
                <span>Si no lo encuentras en unos minutos, revisa tu carpeta de <em>Spam</em> o correo no deseado.</span>
              </div>
              <div class="instruction-item">
                <span class="num">3</span>
                <span>Por seguridad, el enlace expirará automáticamente tras su uso.</span>
              </div>
            </div>

            <!-- Resend / Actions -->
            <div class="success-actions">
              <button 
                type="button" 
                class="df-btn df-btn-secondary btn-resend" 
                (click)="handleResend()" 
                [disabled]="resendCooldown() > 0 || authService.isLoading()"
              >
                @if (resendCooldown() > 0) {
                  <span>Reenviar en {{ resendCooldown() }}s</span>
                } @else {
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  <span>Reenviar Correo</span>
                }
              </button>
            </div>
          </div>
        }

        <!-- Back to login link -->
        <div class="auth-footer">
          <a routerLink="/login" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Volver al inicio de sesión</span>
          </a>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
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
    .auth-card-container {
      width: 100%;
      max-width: 480px;
      background: rgba(18, 20, 24, 0.88);
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
      margin-bottom: 1.5rem;
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

    .auth-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }

    .auth-title {
      font-size: 1.45rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--df-text-primary);
      margin-bottom: 0.25rem;
    }

    .auth-title .highlight {
      color: var(--df-primary);
    }

    .auth-subtitle {
      color: var(--df-text-secondary);
      font-size: 0.85rem;
    }

    .info-banner {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      background: rgba(174, 199, 247, 0.08);
      border: 1px solid rgba(174, 199, 247, 0.2);
      border-radius: var(--df-radius-default);
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      color: var(--df-primary);
    }

    .info-banner p {
      font-size: 0.825rem;
      line-height: 1.4;
      color: var(--df-text-secondary);
      margin: 0;
    }

    /* Error Alert */
    .error-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(255, 180, 171, 0.12);
      border: 1px solid rgba(255, 180, 171, 0.35);
      color: var(--df-error);
      padding: 0.85rem 1rem;
      border-radius: var(--df-radius-default);
      font-size: 0.825rem;
      margin-bottom: 1.25rem;
    }

    .error-msg-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .direct-recovery-btn {
      display: inline-block;
      color: var(--df-primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.82rem;
      margin-top: 0.25rem;
      transition: all var(--df-transition-fast);
    }

    .direct-recovery-btn:hover {
      text-decoration: underline;
      color: #fff;
    }

    .animate-fade {
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Form Styles */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
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

    .auth-input {
      padding-left: 2.75rem;
      padding-right: 1rem;
      height: 46px;
      font-size: 0.9rem;
      background: rgba(25, 28, 33, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all var(--df-transition-fast);
      width: 100%;
    }

    .auth-input:focus {
      border-color: var(--df-primary);
      box-shadow: 0 0 0 3px rgba(174, 199, 247, 0.2);
      background: rgba(30, 34, 40, 0.95);
    }

    .btn-submit {
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

    /* Success State */
    .success-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0.5rem 0;
    }

    .success-icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(107, 227, 161, 0.12);
      border: 1px solid rgba(107, 227, 161, 0.35);
      color: var(--df-success);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: 0 0 25px rgba(107, 227, 161, 0.2);
    }

    .success-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--df-text-primary);
      margin-bottom: 0.35rem;
    }

    .success-desc {
      font-size: 0.85rem;
      color: var(--df-text-secondary);
      margin-bottom: 0.75rem;
    }

    .target-email-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      border-radius: var(--df-radius-full);
      background: rgba(174, 199, 247, 0.1);
      border: 1px solid rgba(174, 199, 247, 0.25);
      color: var(--df-primary);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }

    .instructions-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--df-radius-default);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: left;
      margin-bottom: 1.25rem;
    }

    .instruction-item {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.8rem;
      color: var(--df-text-secondary);
      line-height: 1.35;
    }

    .instruction-item .num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(174, 199, 247, 0.15);
      color: var(--df-primary);
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .success-actions {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-resend {
      height: 42px;
      font-size: 0.85rem;
      font-weight: 600;
      justify-content: center;
      gap: 0.5rem;
    }

    .auth-footer {
      margin-top: 1.75rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.15rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--df-text-secondary);
      text-decoration: none;
      transition: all var(--df-transition-fast);
      cursor: pointer;
    }

    .back-link:hover {
      color: var(--df-primary);
      transform: translateX(-3px);
    }
  `]
})
export class ForgotPasswordComponent implements OnDestroy {
  readonly authService = inject(AuthService);
  readonly supabaseService = inject(SupabaseService);
  readonly router = inject(Router);

  email = '';
  readonly emailSent = signal<boolean>(false);
  readonly resendCooldown = signal<number>(0);

  private timerInterval: any = null;

  async handleSendRecovery() {
    if (!this.email || !this.email.includes('@')) {
      this.authService.errorMessage.set('Ingresa una dirección de correo electrónico válida.');
      return;
    }

    const res = await this.authService.sendPasswordResetEmail(this.email.trim());
    if (res.success) {
      this.emailSent.set(true);
      this.startCooldown(60);
    }
  }

  async handleResend() {
    if (this.resendCooldown() > 0) return;
    const res = await this.authService.sendPasswordResetEmail(this.email.trim());
    if (res.success) {
      this.startCooldown(60);
    }
  }

  private startCooldown(seconds: number) {
    this.resendCooldown.set(seconds);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const current = this.resendCooldown();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.resendCooldown.set(0);
      } else {
        this.resendCooldown.set(current - 1);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
