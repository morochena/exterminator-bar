import type { IntegrationConfig } from '../types';
import { AsanaIntegration } from '../integrations/asana';
import { GithubIntegration } from '../integrations/github';
import { LinearIntegration } from '../integrations/linear';

export class TokenSetupForm {
  private container: HTMLElement;
  private onComplete: (token: string) => void;
  private integrationType: string;

  constructor(integrationType: string, onComplete: (token: string) => void) {
    this.container = this.createContainer();
    this.onComplete = onComplete;
    this.integrationType = integrationType;
    
    document.body.appendChild(this.container);
    this.render();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10002;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    `;
    return container;
  }

  private getInstructions(): string {
    switch (this.integrationType) {
      case 'asana':
        return AsanaIntegration.getSetupInstructions();
      case 'github':
        return GithubIntegration.getSetupInstructions();
      case 'linear':
        return LinearIntegration.getSetupInstructions();
      default:
        return 'Please provide your access token for authentication.';
    }
  }

  private render(): void {
    const form = document.createElement('form');
    form.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
    `;

    form.innerHTML = `
      <h2 style="margin-top: 0; color: black !important;">Setup ${this.integrationType.charAt(0).toUpperCase() + this.integrationType.slice(1)} Integration</h2>
      
      <div class="form-group">
        <p>To use this integration, you'll need to provide an access token. Here's how to get one:</p>
        ${this.getInstructions()}
      </div>

      <div class="form-group">
        <label for="token">Access Token</label>
        <input type="password" id="token" required>
        <small style="color: #666; margin-top: 4px; display: block;">
          Your token will be stored in your browser's local storage.
        </small>
      </div>

      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
        <button type="button" class="button" style="background: #6c757d;" onclick="this.closest('form').dispatchEvent(new Event('cancel'))">
          Cancel
        </button>
        <button type="submit" class="button" style="background: #28a745;">
          Save Token
        </button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .form-group {
        margin-bottom: 15px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      }
      .form-group label {
        display: block !important;
        margin-bottom: 5px !important;
        font-weight: 500 !important;
        color: #000 !important;
        font-size: 14px !important;
      }
      .form-group input[type="password"] {
        width: 100% !important;
        padding: 8px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        font-family: inherit !important;
      }
      .form-group input[type="password"]:focus {
        outline: none !important;
        border-color: #4a90e2 !important;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2) !important;
      }
      .button {
        border: none !important;
        padding: 8px 16px !important;
        border-radius: 4px !important;
        color: white !important;
        cursor: pointer !important;
        font-size: 14px !important;
      }
      .button:hover {
        opacity: 0.9 !important;
      }
      ol {
        margin: 10px 0 !important;
        padding-left: 20px !important;
      }
      li {
        margin-bottom: 5px !important;
        color: #333 !important;
      }
    `;

    form.appendChild(style);
    this.container.appendChild(form);

    // Add event listeners
    form.addEventListener('submit', this.handleSubmit.bind(this));
    form.addEventListener('cancel', () => this.container.remove());
  }

  private handleSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const token = (form.querySelector('#token') as HTMLInputElement).value;
    
    // Store token in localStorage
    localStorage.setItem(`exterminator_${this.integrationType}_token`, token);
    
    // Call completion handler
    this.onComplete(token);
    
    // Remove form
    this.container.remove();
  }
} 