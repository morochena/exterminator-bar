import type { BugReport, VisualFeedback } from '../types';

interface FormData extends Partial<BugReport> {
  selectedElement?: VisualFeedback['selectedElement'];
}

export class BugReportForm {
  private container: HTMLElement;
  private formData: FormData = {
    reproductionSteps: {
      steps: [],
      userActions: []
    }
  };
  private onSubmit?: (report: BugReport) => void;

  constructor(
    screenshot: string | null,
    screenRecording: VisualFeedback['screenRecording'] | null,
    selectedElement: VisualFeedback['selectedElement'] | null,
    onSubmit?: (report: BugReport) => void
  ) {
    this.container = this.createContainer();
    this.formData.visualFeedback = {
      ...(screenshot ? { screenshot } : {}),
      ...(screenRecording ? { screenRecording } : {}),
      annotations: []
    };
    this.formData.selectedElement = selectedElement || undefined;
    this.onSubmit = onSubmit;
    
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
      <h2 style="margin-top: 0;">Report a Bug</h2>
      
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
          <option value="bug">Bug</option>
          <option value="feature">Feature Request</option>
          <option value="improvement">Improvement</option>
          <option value="question">Question</option>
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
        margin-bottom: 15px;
      }
      .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .button {
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        color: white;
        cursor: pointer;
        font-size: 14px;
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