import type { BugReport, VisualFeedback } from '../types';
import type { 
  IntegrationConfig, 
  AsanaConfig, 
  GithubConfig, 
  LinearConfig 
} from '../types';
import { TokenSetupForm } from './TokenSetupForm';

interface FormData extends Partial<BugReport> {
  selectedElement?: VisualFeedback['selectedElement'];
}

type ReportType = 'bug' | 'feature' | 'improvement' | 'question';

export class BugReportForm {
  private container: HTMLElement;
  private formData: FormData = {}; 
  private onSubmit?: (report: BugReport) => void;
  private config?: { integration?: IntegrationConfig };

  constructor(
    screenshot: string | null,
    screenRecording: VisualFeedback['screenRecording'] | null,
    selectedElement: VisualFeedback['selectedElement'] | null,
    onSubmit?: (report: BugReport) => void,
    config?: { integration?: IntegrationConfig }
  ) {
    this.container = this.createContainer();
    this.formData.visualFeedback = {
      ...(screenshot ? { screenshot } : {}),
      ...(screenRecording ? { screenRecording } : {}),
      annotations: []
    };
    this.formData.selectedElement = selectedElement || undefined;
    this.onSubmit = onSubmit;
    this.config = config;
    
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
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    `;
    return container;
  }

  private getTypeOptions(): string {
    const defaultTypes: Array<{ value: ReportType; label: string }> = [
      { value: 'bug', label: 'Bug' },
      { value: 'feature', label: 'Feature Request' },
      { value: 'improvement', label: 'Improvement' },
      { value: 'question', label: 'Question' }
    ];

    // If we have a Linear integration with labelMap, only show types that have corresponding labels
    if (this.config?.integration?.type === 'linear' && this.config.integration.labelMap) {
      return defaultTypes
        .filter(type => this.config?.integration?.type === 'linear' && this.config.integration.labelMap?.[type.value])
        .map(type => `<option value="${type.value}">${type.label}</option>`)
        .join('');
    }

    // Otherwise show all default types
    return defaultTypes
      .map(type => `<option value="${type.value}">${type.label}</option>`)
      .join('');
  }

  private hasSavedTokens(): boolean {
    const integrationTypes = ['asana', 'github', 'linear'];
    return integrationTypes.some(type => 
      localStorage.getItem(`exterminator_${type}_token`) !== null
    );
  }

  private clearSavedTokens(): void {
    const integrationTypes = ['asana', 'github', 'linear'];
    integrationTypes.forEach(type => {
      localStorage.removeItem(`exterminator_${type}_token`);
    });
  }

  private render(): void {
    const form = document.createElement('form');
    form.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    `;

    form.innerHTML = `
      <h2 style="margin-top: 0; color: black !important;">Report a Bug</h2>
      
      <div id="feedback-message" style="display: none; padding: 10px; margin-bottom: 15px; border-radius: 4px;"></div>

      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" id="title" required>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea id="description" rows="4" required></textarea>
      </div>

      <div class="form-group">
        <label for="type">Type</label>
        <select id="type" required>
          ${this.getTypeOptions()}
        </select>
      </div>

      <div class="form-group">
        <label for="severity">Severity</label>
        <select id="severity" required>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      ${this.formData.visualFeedback?.screenshot ? `
        <div class="form-group">
          <label>Screenshot</label>
          <img src="${this.formData.visualFeedback.screenshot}" 
               style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;">
        </div>
      ` : ''}

      ${this.formData.visualFeedback?.screenRecording ? `
        <div class="form-group">
          <label>Screen Recording</label>
          <video 
            src="${this.formData.visualFeedback.screenRecording.url}"
            controls
            style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;">
          </video>
          <div style="margin-top: 4px; color: #666; font-size: 12px;">
            Size: ${(this.formData.visualFeedback.screenRecording.size / (1024 * 1024)).toFixed(1)} MB
          </div>
        </div>
      ` : ''}

      ${this.formData.selectedElement ? `
        <div class="form-group">
          <label>Selected Element</label>
          <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
${JSON.stringify(this.formData.selectedElement, null, 2)}
          </pre>
        </div>
      ` : ''}

      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
        ${this.hasSavedTokens() ? `
          <button type="button" class="button" style="background: #dc3545;" onclick="this.closest('form').dispatchEvent(new Event('clear-tokens'))">
            Clear Saved Tokens
          </button>
        ` : ''}
        <button type="button" class="button" style="background: #6c757d;" onclick="this.closest('form').dispatchEvent(new Event('cancel'))">
          Cancel
        </button>
        <button type="submit" id="submit-button" class="button" style="background: #28a745;">
          Submit Report
        </button>
      </div>
    `;

    // Add styles for form elements
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
      .form-group input[type="text"],
      .form-group textarea,
      .form-group select {
        width: 100% !important;
        padding: 8px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        font-family: inherit !important;
        background-color: #fff !important;
        color: #000 !important;
      }
      .form-group input[type="text"]:focus,
      .form-group textarea:focus,
      .form-group select:focus {
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
        font-family: inherit !important;
        line-height: 1.4 !important;
        margin: 0 !important;
        text-transform: none !important;
        text-decoration: none !important;
        text-align: center !important;
      }
      .button:hover {
        opacity: 0.9 !important;
      }
      .button:disabled {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
      }
      .feedback-success {
        background-color: #d4edda !important;
        color: #155724 !important;
        border: 1px solid #c3e6cb !important;
      }
      .feedback-error {
        background-color: #f8d7da !important;
        color: #721c24 !important;
        border: 1px solid #f5c6cb !important;
      }
    `;

    form.appendChild(style);
    this.container.appendChild(form);

    // Add event listeners
    form.addEventListener('submit', this.handleSubmit.bind(this));
    form.addEventListener('cancel', () => this.container.remove());
    form.addEventListener('clear-tokens', () => {
      this.clearSavedTokens();
      // Re-render the form to update the button visibility
      this.container.innerHTML = '';
      this.render();
    });
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const submitButton = form.querySelector('#submit-button') as HTMLButtonElement;
    const feedbackMessage = form.querySelector('#feedback-message') as HTMLDivElement;
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    try {
      const report: BugReport = {
        id: crypto.randomUUID(),
        title: (form.querySelector('#title') as HTMLInputElement).value,
        description: (form.querySelector('#description') as HTMLTextAreaElement).value,
        type: (form.querySelector('#type') as HTMLSelectElement).value as BugReport['type'],
        severity: (form.querySelector('#severity') as HTMLSelectElement).value as BugReport['severity'],
        status: 'draft',
        url: window.location.href,
        createdAt: new Date().toISOString(),
        environment: {
          browser: navigator.userAgent,
          browserVersion: navigator.appVersion,
          os: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          userAgent: navigator.userAgent,
          currentUrl: window.location.href
        },
        visualFeedback: this.formData.visualFeedback,
        labels: [],
        customFields: {}
      };

      try {
        await this.submitWithTokenHandling(report);
        
        // Show success message
        feedbackMessage.textContent = 'Bug report submitted successfully!';
        feedbackMessage.className = 'feedback-success';
        feedbackMessage.style.display = 'block';
        
        // Close form after a short delay
        setTimeout(() => {
          this.container.remove();
        }, 1500);
      } catch (error) {
        // Show error message with the actual error from the integration
        feedbackMessage.textContent = error instanceof Error ? error.message : 'Failed to submit bug report';
        feedbackMessage.className = 'feedback-error';
        feedbackMessage.style.display = 'block';
        throw error; // Re-throw to trigger the catch block below
      }
    } catch (error) {
      // Re-enable submit button on any error
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Report';
    }
  }

  private async submitWithTokenHandling(report: BugReport): Promise<void> {
    if (!this.config?.integration) {
      await this.onSubmit?.(report);
      return;
    }

    const integration = this.config.integration;
    const token = localStorage.getItem(`exterminator_${integration.type}_token`) || integration.token;

    if (!token) {
      await this.handleTokenSetup(report);
      return;
    }
    
    try {
      // Just pass the integration config directly
      const reportWithConfig: BugReport = {
        ...report,
        config: { integration }
      };
      
      await this.onSubmit?.(reportWithConfig);
    } catch (error) {
      // If unauthorized, show token setup
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        await this.handleTokenSetup(report);
      } else {
        throw error;
      }
    }
  }

  private handleTokenSetup(report: BugReport): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config?.integration) {
        reject(new Error('No integration configured'));
        return;
      }

      const integration = this.config.integration;

      new TokenSetupForm(integration.type, async (token: string) => {
        const reportWithToken: BugReport = {
          ...report,
          config: {
            integration: integration.type === 'asana' ? {
              type: 'asana' as const,
              token,
              project: (integration as AsanaConfig).project,
              workspace: (integration as AsanaConfig).workspace,
              defaultSection: (integration as AsanaConfig).defaultSection
            } : integration.type === 'github' ? {
              type: 'github' as const,
              token,
              owner: (integration as GithubConfig).owner,
              repo: (integration as GithubConfig).repo,
              labels: (integration as GithubConfig).labels
            } : integration.type === 'linear' ? {
              type: 'linear' as const,
              token,
              teamId: (integration as LinearConfig).teamId,
              status: (integration as LinearConfig).status,
              template: (integration as LinearConfig).template,
              project: (integration as LinearConfig).project,
              projectMilestone: (integration as LinearConfig).projectMilestone,
              cycle: (integration as LinearConfig).cycle,
              estimate: (integration as LinearConfig).estimate,
              labelMap: (integration as LinearConfig).labelMap,
              priorityMap: (integration as LinearConfig).priorityMap
            } : integration // webhook case
          }
        };

        try {
          await this.onSubmit?.(reportWithToken);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }
} 