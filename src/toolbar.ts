import { captureScreenshot } from './services/screenshot';
import { Annotator } from './services/annotator';
import { BugReportForm } from './components/BugReportForm';
import { ColorPicker } from './components/ColorPicker';
import { IntegrationManager } from './integrations/manager';
import type { BugReport, VisualFeedback, WidgetConfig } from './types';

export class BugToolbar {
  private toolbar: HTMLElement;
  private annotator: Annotator | null = null;
  private colorPicker: ColorPicker;
  private screenshot: string | null = null;
  private annotations: VisualFeedback['annotations'] = [];
  private integrationManager?: IntegrationManager;

  constructor(private config?: WidgetConfig) {
    this.toolbar = this.createToolbar();
    this.colorPicker = new ColorPicker(this.handleColorSelect.bind(this));
    
    if (config?.integration) {
      this.integrationManager = new IntegrationManager(config.integration);
    }
    
    document.body.appendChild(this.toolbar);
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.id = 'qa-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      gap: 8px;
      z-index: 10000;
    `;

    const screenshotBtn = this.createToolbarButton('📸', 'Capture Screenshot');
    screenshotBtn.onclick = this.handleScreenshot.bind(this);

    const reportBtn = this.createToolbarButton('🐛', 'Report Bug');
    reportBtn.onclick = this.handleBugReport.bind(this);

    toolbar.appendChild(screenshotBtn);
    toolbar.appendChild(reportBtn);

    return toolbar;
  }

  private createToolbarButton(icon: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = icon;
    button.title = tooltip;
    button.style.cssText = `
      border: none;
      background: transparent;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    `;

    button.onmouseover = () => {
      button.style.backgroundColor = '#f0f0f0';
    };

    button.onmouseout = () => {
      button.style.backgroundColor = 'transparent';
    };

    return button;
  }

  private async handleScreenshot(): Promise<void> {
    try {
      // Hide toolbar temporarily
      this.toolbar.style.display = 'none';
      
      // Capture screenshot
      this.screenshot = await captureScreenshot();
      
      // Show toolbar again
      this.toolbar.style.display = 'flex';
      
      // Initialize annotator
      this.showAnnotator();
    } catch (error) {
      console.error('Screenshot failed:', error);
      this.toolbar.style.display = 'flex';
    }
  }

  private async handleSubmit(report: BugReport): Promise<void> {
    try {
      // Submit to integration if configured
      if (this.integrationManager) {
        const result = await this.integrationManager.submitReport(report);
        if (!result.success) {
          console.error('Integration failed:', result.error);
          this.config?.callbacks?.onError?.(
            new Error(result.error || 'Failed to submit report')
          );
        }
      } else {
        console.log('No integration configured, skipping submission');
        console.log('Bug report:', report);  
      }

      // Call onSubmit callback if provided
      await this.config?.callbacks?.onSubmit?.(report);
    } catch (error) {
      console.error('Failed to submit report:', error);
      this.config?.callbacks?.onError?.(
        error instanceof Error ? error : new Error('Failed to submit report')
      );
    }
  }

  private handleBugReport(): void {
    const form = new BugReportForm(
      this.screenshot,
      null,
      this.handleSubmit.bind(this)
    );

    // Clear state when form is destroyed (happens on both cancel and submit)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.querySelector('form')) {
            this.screenshot = null;
            this.annotations = [];
            observer.disconnect();
          }
        });
      });
    });

    observer.observe(document.body, { childList: true });
  }

  private handleAnnotationTool(mode: string, event?: MouseEvent): void {
    if (!this.annotator) return;

    switch (mode) {
      case 'select':
      case 'highlight':
      case 'text':
      case 'arrow':
        this.annotator.setMode(mode as 'select' | 'highlight' | 'arrow' | 'text');
        break;
      case 'color':
        if (event) {
          const rect = (event.target as HTMLElement).getBoundingClientRect();
          this.colorPicker.show(rect.left, rect.bottom + 5);
        }
        break;
      case 'done':
        this.handleAnnotationDone();
        break;
    }
  }

  private handleColorSelect(color: string): void {
    if (this.annotator) {
      this.annotator.setColor(color);
    }
  }

  private handleAnnotationDone(): void {
    if (!this.annotator) return;
    
    // Get annotations metadata
    this.annotations = this.annotator.getAnnotations();
    
    // Update the screenshot with the annotated version
    if (this.screenshot) {
      this.screenshot = this.annotator.getAnnotatedImage();
    }
    
    // Clean up
    this.annotator.destroy();
    this.annotator = null;
    
    // Remove annotation container
    const container = document.querySelector('div[style*="z-index: 10001"]');
    container?.remove();

    // Open the bug report form
    this.handleBugReport();
  }

  private showAnnotator(): void {
    if (!this.screenshot) return;

    // Create annotation container
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
      flex-direction: column;
      padding: 10px;
    `;

    // Create toolbar for annotation tools
    const annotationToolbar = document.createElement('div');
    annotationToolbar.style.cssText = `
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      background: white;
      padding: 8px;
      border-radius: 4px;
      justify-content: space-between;
      align-items: center;
    `;

    // Initialize annotator first so we can register buttons
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      margin: 0;
      padding: 0;
      background: #2c2c2c;
    `;
    container.appendChild(canvasContainer);

    this.annotator = new Annotator(canvasContainer, this.screenshot);

    // Create a container for the main tools
    const mainTools = document.createElement('div');
    mainTools.style.cssText = `
      display: flex;
      gap: 10px;
    `;

    // Add annotation tools
    const tools = [
      { icon: '🔍', mode: 'select', label: 'Select' },
      { icon: '✏️', mode: 'highlight', label: 'Highlight' },
      { icon: '➡️', mode: 'arrow', label: 'Arrow' },
      { icon: '📝', mode: 'text', label: 'Text' },
      { icon: '🎨', mode: 'color', label: 'Color' },
      { icon: '✅', mode: 'done', label: 'Done' }
    ];

    tools.forEach(tool => {
      const button = this.createAnnotationButton(tool.icon, tool.label, tool.mode);
      button.onclick = (e) => this.handleAnnotationTool(tool.mode, e);
      mainTools.appendChild(button);

      // Register button with annotator for mode highlighting
      if (tool.mode !== 'color' && tool.mode !== 'done') {
        this.annotator?.registerToolbarButton(tool.mode, button);
      }
    });

    // Create cancel button
    const cancelButton = this.createAnnotationButton('❌', 'Cancel', 'cancel');
    cancelButton.onclick = () => {
      // Clean up
      this.annotator?.destroy();
      this.annotator = null;
      this.screenshot = null;
      
      // Remove annotation container
      container.remove();
    };

    annotationToolbar.appendChild(mainTools);
    annotationToolbar.appendChild(cancelButton);

    container.insertBefore(annotationToolbar, canvasContainer);
    document.body.appendChild(container);
  }

  private createAnnotationButton(icon: string, tooltip: string, mode: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = icon;
    button.title = tooltip;
    button.style.cssText = `
      border: 1px solid #ddd;
      background: white;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    return button;
  }
}

// Initialize the bug tool
export function initBugTool(config?: WidgetConfig): void {
  new BugToolbar(config);
}