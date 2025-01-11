import type { BugReport, VisualFeedback } from '../types';
import type { 
  IntegrationConfig, 
  AsanaConfig, 
  GithubConfig, 
  LinearConfig 
} from '../types';
import { TokenSetupForm } from './TokenSetupForm';
import '../styles/main.css';

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
    container.className = 'fixed inset-0 bg-black/80 z-[10001] flex justify-center items-center p-5';
    return container;
  }

  private getTypeOptions(): string {
    const defaultTypes: Array<{ value: ReportType; label: string }> = [
      { value: 'bug', label: 'Bug' },
      { value: 'feature', label: 'Feature Request' },
      { value: 'improvement', label: 'Improvement' },
      { value: 'question', label: 'Question' }
    ];

    if (this.config?.integration?.type === 'linear' && this.config.integration.labelMap) {
      return defaultTypes
        .filter(type => this.config?.integration?.type === 'linear' && this.config.integration.labelMap?.[type.value])
        .map(type => `<option value="${type.value}">${type.label}</option>`)
        .join('');
    }

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
    form.className = 'font-sans bg-white p-5 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto';

    form.innerHTML = `
      <h2 class="mt-0 mb-4 text-xl font-semibold text-gray-900">Report a Bug</h2>
      
      <div id="feedback-message" class="hidden p-2.5 mb-4 rounded"></div>

      <div class="mb-4">
        <label for="title" class="block mb-1 font-medium text-sm text-gray-900">Title</label>
        <input type="text" id="title" class="exterminator-form-input" required>
      </div>

      <div class="mb-4">
        <label for="description" class="block mb-1 font-medium text-sm text-gray-900">Description</label>
        <textarea id="description" rows="4" class="exterminator-form-input" required></textarea>
      </div>

      <div class="mb-4">
        <label for="type" class="block mb-1 font-medium text-sm text-gray-900">Type</label>
        <select id="type" class="exterminator-form-input" required>
          ${this.getTypeOptions()}
        </select>
      </div>

      <div class="mb-4">
        <label for="severity" class="block mb-1 font-medium text-sm text-gray-900">Severity</label>
        <select id="severity" class="exterminator-form-input" required>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      ${this.formData.visualFeedback?.screenshot ? `
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-900">Screenshot</label>
          <img src="${this.formData.visualFeedback.screenshot}" 
               class="max-w-full border border-gray-200 rounded-md">
        </div>
      ` : ''}

      ${this.formData.visualFeedback?.screenRecording ? `
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-900">Screen Recording</label>
          <video 
            src="${this.formData.visualFeedback.screenRecording.url}"
            controls
            class="max-w-full border border-gray-200 rounded-md">
          </video>
          <div class="mt-1 text-sm text-gray-500">
            Size: ${(this.formData.visualFeedback.screenRecording.size / (1024 * 1024)).toFixed(1)} MB
          </div>
        </div>
      ` : ''}

      ${this.formData.selectedElement ? `
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-900">Selected Element</label>
          <pre class="bg-gray-50 p-2.5 rounded-md overflow-auto text-sm">
${JSON.stringify(this.formData.selectedElement, null, 2)}
          </pre>
        </div>
      ` : ''}

      <div class="flex gap-2.5 justify-end mt-5">
        ${this.hasSavedTokens() ? `
          <button type="button" class="exterminator-btn-danger" onclick="this.closest('form').dispatchEvent(new Event('clear-tokens'))">
            Clear Saved Tokens
          </button>
        ` : ''}
        <button type="button" class="exterminator-btn-secondary" onclick="this.closest('form').dispatchEvent(new Event('cancel'))">
          Cancel
        </button>
        <button type="submit" id="submit-button" class="exterminator-btn-primary">
          Submit Report
        </button>
      </div>
    `;

    this.container.appendChild(form);

    // Add event listeners
    form.addEventListener('submit', this.handleSubmit.bind(this));
    form.addEventListener('cancel', () => this.container.remove());
    form.addEventListener('clear-tokens', () => {
      this.clearSavedTokens();
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
        feedbackMessage.className = 'p-2.5 mb-4 rounded bg-green-100 text-green-800 border border-green-200';
        feedbackMessage.style.display = 'block';
        
        // Close form after a short delay
        setTimeout(() => {
          this.container.remove();
        }, 1500);
      } catch (error) {
        // Show error message with the actual error from the integration
        feedbackMessage.textContent = error instanceof Error ? error.message : 'Failed to submit bug report';
        feedbackMessage.className = 'p-2.5 mb-4 rounded bg-red-100 text-red-800 border border-red-200';
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