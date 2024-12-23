import type { BugReport, VisualFeedback } from '../types';
import type { IntegrationConfig } from '../types';

interface FormData extends Partial<BugReport> {
  selectedElement?: VisualFeedback['selectedElement'];
}

type ReportType = 'bug' | 'feature' | 'improvement' | 'question';

export class BugReportForm {
  private container: HTMLElement;
  private formData: FormData = {
    reproductionSteps: {
      steps: [],
      userActions: []
    }
  };
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

  private render(): void {
    const form = document.createElement('form');
    form.style.cssText = `
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
        <button type="button" class="button" style="background: #6c757d;" onclick="this.closest('form').dispatchEvent(new Event('cancel'))">
          Cancel
        </button>
        <button type="submit" class="button" style="background: #28a745;">
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
    `;

    form.appendChild(style);
    this.container.appendChild(form);

    // Add event listeners
    form.addEventListener('submit', this.handleSubmit.bind(this));
    form.addEventListener('cancel', () => this.container.remove());
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    
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
      reproductionSteps: this.formData.reproductionSteps!,
      visualFeedback: this.formData.visualFeedback,
      labels: [],
      customFields: {}
    };

    await this.onSubmit?.(report);
    this.container.remove();
  }
} 