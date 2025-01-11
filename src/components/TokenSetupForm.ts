import { AsanaIntegration } from '../integrations/asana';
import { GithubIntegration } from '../integrations/github';
import { LinearIntegration } from '../integrations/linear';
import '../styles/main.css';

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
    container.className = 'fixed inset-0 bg-black/80 z-[10002] flex justify-center items-center p-5 font-sans';
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
    form.className = 'bg-white p-5 rounded-lg w-full max-w-lg';

    form.innerHTML = `
      <h2 class="mt-0 mb-4 text-xl font-semibold text-gray-900">
        Setup ${this.integrationType.charAt(0).toUpperCase() + this.integrationType.slice(1)} Integration
      </h2>
      
      <div class="mb-4">
        <p class="text-gray-700 mb-2">To use this integration, you'll need to provide an access token. Here's how to get one:</p>
        <div class="text-gray-700">${this.getInstructions()}</div>
      </div>

      <div class="mb-4">
        <label for="token" class="block mb-1 font-medium text-sm text-gray-900">Access Token</label>
        <input type="password" id="token" class="exterminator-form-input" required>
        <small class="mt-1 text-sm text-gray-500 block">
          Your token will be stored in your browser's local storage.
        </small>
      </div>

      <div class="flex gap-2.5 justify-end mt-5">
        <button type="button" class="exterminator-btn-secondary" onclick="this.closest('form').dispatchEvent(new Event('cancel'))">
          Cancel
        </button>
        <button type="submit" class="exterminator-btn-primary">
          Save Token
        </button>
      </div>
    `;

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