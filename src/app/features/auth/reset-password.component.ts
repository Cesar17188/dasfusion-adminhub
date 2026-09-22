import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
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
            <span class="df-pill df-pill-primary">CREAR NUEVA CONTRASEÑA</span>
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
            Establece una contraseña segura para tu cuenta de administrador
          </p>
        </div>

        <!-- Error Alert -->
        @if (authService.errorMessage() || localError()) {
          <div class="error-alert animate-fade">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{{ localError() || authService.errorMessage() }}</span>
          </div>
        }

        <!-- Reset Form -->
        <form (ngSubmit)="handleResetPassword()" class="auth-form">
          
          <!-- New Password -->
          <div class="form-group">
            <label class="df-label">Nueva Contraseña</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                class="df-input auth-input" 
                [(ngModel)]="newPassword" 
                name="newPassword" 
                required 
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                [disabled]="authService.isLoading()"
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

          <!-- Strength bar -->
          @if (newPassword) {
            <div class="strength-meter-container animate-fade">
              <div class="strength-bars">
                <div class="bar" [class.active]="strengthScore() >= 1" [class.weak]="strengthScore() === 1" [class.medium]="strengthScore() === 2" [class.strong]="strengthScore() >= 3"></div>
                <div class="bar" [class.active]="strengthScore() >= 2" [class.medium]="strengthScore() === 2" [class.strong]="strengthScore() >= 3"></div>
                <div class="bar" [class.active]="strengthScore() >= 3" [class.strong]="strengthScore() >= 3"></div>
                <div class="bar" [class.active]="strengthScore() >= 4" [class.strong]="strengthScore() >= 4"></div>
              </div>
              <span class="strength-label" [class.weak]="strengthScore() <= 1" [class.medium]="strengthScore() === 2" [class.strong]="strengthScore() >= 3">
                {{ strengthLabel() }}
              </span>
            </div>
          }

          <!-- Confirm Password -->
          <div class="form-group">
            <label class="df-label">Confirmar Contraseña</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <input 
                [type]="showConfirmPassword() ? 'text' : 'password'" 
                class="df-input auth-input" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                required 
                autocomplete="new-password"
                placeholder="Repite tu contraseña"
                [disabled]="authService.isLoading()"
              />
              <button 
                type="button" 
                class="eye-btn" 
                (click)="showConfirmPassword.set(!showConfirmPassword())"
                tabindex="-1"
              >
                @if (showConfirmPassword()) {
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

          <!-- Password Requirements Checklist -->
          <div class="requirements-box">
            <span class="req-title">Requisitos de seguridad:</span>
            <ul class="req-list">
              <li [class.valid]="hasMinLength()">
                <span class="icon">{{ hasMinLength() ? '✓' : '•' }}</span>
                <span>Mínimo 8 caracteres</span>
              </li>
              <li [class.valid]="hasLetters()">
                <span class="icon">{{ hasLetters() ? '✓' : '•' }}</span>
                <span>Incluye letras mayúsculas y minúsculas</span>
              </li>
              <li [class.valid]="hasNumbersOrSymbols()">
                <span class="icon">{{ hasNumbersOrSymbols() ? '✓' : '•' }}</span>
                <span>Al menos un número o símbolo</span>
              </li>
              <li [class.valid]="passwordsMatch() && confirmPassword.length > 0">
                <span class="icon">{{ (passwordsMatch() && confirmPassword.length > 0) ? '✓' : '•' }}</span>
                <span>Las contraseñas coinciden</span>
              </li>
            </ul>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="df-btn df-btn-primary btn-submit" 
            [disabled]="authService.isLoading() || !isFormValid()"
          >
            @if (authService.isLoading()) {
              <span class="spinner"></span>
              <span>Guardando nueva contraseña...</span>
            } @else {
              <span>Actualizar Contraseña</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
            }
          </button>
        </form>

        <!-- Back to login footer -->
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

      <!-- Success Modal Dialog -->
      @if (showSuccessDialog()) {
        <div class="dialog-backdrop animate-fade" (click)="closeDialogAndRedirect()">
          <div class="dialog-card animate-scale" (click)="$event.stopPropagation()">
            
            <!-- Close icon button -->
            <button type="button" class="dialog-close-btn" (click)="closeDialogAndRedirect()" title="Cerrar y volver al login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <!-- Success Icon Badge -->
            <div class="dialog-badge-wrapper">
              <div class="dialog-icon-badge">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>

            <!-- Dialog Content -->
            <div class="dialog-body">
              <h3 class="dialog-title">¡Contraseña Actualizada!</h3>
              <p class="dialog-desc">
                La contraseña de administrador se ha cambiado exitosamente y tus credenciales han sido sincronizadas en el sistema seguro.
              </p>
              <div class="dialog-info-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>Ya puedes iniciar sesión con tu nueva contraseña.</span>
              </div>
            </div>

            <!-- Dialog Footer Actions -->
            <div class="dialog-footer">
              <button 
                type="button" 
                class="df-btn df-btn-primary dialog-action-btn"
                (click)="closeDialogAndRedirect()"
              >
                <span>Aceptar e Iniciar Sesión</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>

          </div>
        </div>
      }

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
      animation: fadeIn 0.25s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
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
      padding-right: 2.5rem;
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

    /* Strength Meter */
    .strength-meter-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: -0.35rem;
    }

    .strength-bars {
      display: flex;
      gap: 4px;
      flex: 1;
    }

    .bar {
      height: 4px;
      flex: 1;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.1);
      transition: all var(--df-transition-fast);
    }

    .bar.active.weak { background: var(--df-error); }
    .bar.active.medium { background: var(--df-warning, #f6ad55); }
    .bar.active.strong { background: var(--df-success); }

    .strength-label {
      font-size: 0.725rem;
      font-weight: 600;
      min-width: 60px;
      text-align: right;
    }

    .strength-label.weak { color: var(--df-error); }
    .strength-label.medium { color: var(--df-warning, #f6ad55); }
    .strength-label.strong { color: var(--df-success); }

    /* Requirements Box */
    .requirements-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: var(--df-radius-default);
      padding: 0.85rem 1rem;
    }

    .req-title {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--df-text-muted);
      margin-bottom: 0.5rem;
    }

    .req-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .req-list li {
      font-size: 0.775rem;
      color: var(--df-text-muted);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: color var(--df-transition-fast);
    }

    .req-list li.valid {
      color: var(--df-success);
    }

    .req-list li .icon {
      font-weight: 700;
      width: 12px;
      display: inline-block;
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

    /* Dialog Modal Styles */
    .dialog-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(11, 13, 17, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .dialog-card {
      width: 100%;
      max-width: 440px;
      background: #13171f;
      border: 1px solid rgba(107, 227, 161, 0.3);
      border-radius: var(--df-radius-lg);
      padding: 2.25rem 2rem 1.75rem;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(107, 227, 161, 0.12);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .animate-scale {
      animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.92) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .dialog-close-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: var(--df-text-muted);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: var(--df-radius-default);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--df-transition-fast);
    }

    .dialog-close-btn:hover {
      color: var(--df-text-primary);
      background: rgba(255, 255, 255, 0.08);
    }

    .dialog-badge-wrapper {
      margin-bottom: 1.25rem;
    }

    .dialog-icon-badge {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(107, 227, 161, 0.2) 0%, rgba(107, 227, 161, 0.05) 70%);
      border: 2px solid rgba(107, 227, 161, 0.4);
      color: var(--df-success);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(107, 227, 161, 0.3);
      animation: pulseBadge 2s infinite alternate ease-in-out;
    }

    @keyframes pulseBadge {
      from { transform: scale(1); box-shadow: 0 0 20px rgba(107, 227, 161, 0.25); }
      to { transform: scale(1.04); box-shadow: 0 0 35px rgba(107, 227, 161, 0.45); }
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .dialog-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--df-text-primary);
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .dialog-desc {
      font-size: 0.875rem;
      color: var(--df-text-secondary);
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .dialog-info-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.8rem;
      border-radius: var(--df-radius-full);
      background: rgba(174, 199, 247, 0.08);
      border: 1px solid rgba(174, 199, 247, 0.2);
      color: var(--df-primary);
      font-size: 0.775rem;
      font-weight: 500;
    }

    .dialog-footer {
      width: 100%;
    }

    .dialog-action-btn {
      width: 100%;
      height: 46px;
      font-size: 0.925rem;
      font-weight: 700;
      justify-content: center;
      gap: 0.6rem;
      box-shadow: 0 4px 16px rgba(174, 199, 247, 0.25);
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly supabaseService = inject(SupabaseService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);

  newPassword = '';
  confirmPassword = '';
  targetEmail = '';
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly localError = signal<string | null>(null);
  readonly showSuccessDialog = signal<boolean>(false);

  // Validation rules
  readonly hasMinLength = computed(() => this.newPassword.length >= 8);
  readonly hasLetters = computed(() => /[A-Z]/.test(this.newPassword) && /[a-z]/.test(this.newPassword));
  readonly hasNumbersOrSymbols = computed(() => /[0-9]/.test(this.newPassword) || /[^A-Za-z0-9]/.test(this.newPassword));
  readonly passwordsMatch = computed(() => this.newPassword === this.confirmPassword);

  readonly strengthScore = computed(() => {
    let score = 0;
    if (this.hasMinLength()) score++;
    if (/[A-Z]/.test(this.newPassword)) score++;
    if (/[0-9]/.test(this.newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(this.newPassword)) score++;
    return score;
  });

  readonly strengthLabel = computed(() => {
    const s = this.strengthScore();
    if (s <= 1) return 'Débil';
    if (s === 2) return 'Media';
    if (s === 3) return 'Fuerte';
    return 'Muy Fuerte';
  });

  readonly isFormValid = computed(() => {
    return this.hasMinLength() && this.passwordsMatch() && this.confirmPassword.length > 0;
  });

  @HostListener('window:keydown.escape')
  onEscapePress() {
    if (this.showSuccessDialog()) {
      this.closeDialogAndRedirect();
    }
  }

  async ngOnInit() {
    this.authService.errorMessage.set(null);

    // Capture email from query params if present
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.targetEmail = emailParam;
    }

    // Check if recovery code is present (Supabase PKCE flow)
    const code = this.route.snapshot.queryParamMap.get('code');
    const client = this.supabaseService.getClient();
    if (client) {
      if (code) {
        try {
          const { data } = await client.auth.exchangeCodeForSession(code);
          if (data?.session?.user?.email) {
            this.targetEmail = data.session.user.email;
          }
        } catch (err) {
          console.warn('Could not exchange recovery code for session:', err);
        }
      } else {
        try {
          const { data } = await client.auth.getSession();
          if (data?.session?.user?.email) {
            this.targetEmail = data.session.user.email;
          }
        } catch {
          // ignore
        }
      }
    }
  }

  async handleResetPassword() {
    this.localError.set(null);

    if (!this.hasMinLength()) {
      this.localError.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!this.passwordsMatch()) {
      this.localError.set('Las contraseñas ingresadas no coinciden.');
      return;
    }

    const res = await this.authService.updateUserPassword(this.newPassword, this.targetEmail);
    if (res.success) {
      this.showSuccessDialog.set(true);
    }
  }

  closeDialogAndRedirect() {
    this.showSuccessDialog.set(false);
    this.router.navigate(['/login']);
  }
}
