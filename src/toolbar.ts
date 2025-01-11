import { ScreenRecorder } from './services/screenRecorder';
import { Annotator } from './services/annotator';
import { BugReportForm } from './components/BugReportForm';
import { ColorPicker } from './components/ColorPicker';
import { IntegrationManager } from './integrations/manager';
import type { BugReport, VisualFeedback, IntegrationConfig } from './types';

// Utility to check if we're in a browser environment
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface WidgetConfig {
  integration?: IntegrationConfig;
  callbacks?: {
    onSubmit?: (report: BugReport) => Promise<void>;
    onError?: (error: Error) => void;
  };
}

// Renamed to indicate it's internal
class ExterminatorToolBarInternal {
  private toolbar: HTMLElement;
  private annotator: Annotator | null = null;
  private colorPicker: ColorPicker;
  private screenshot: string | null = null;
  private screenRecorder: ScreenRecorder;
  private screenRecordingData: VisualFeedback['screenRecording'] | null = null;
  private integrationManager?: IntegrationManager;
  private recordButton!: HTMLButtonElement;

  constructor(private config?: WidgetConfig) {
    if (!isClient) {
      throw new Error('ExterminatorToolBar can only be initialized in a browser environment');
    }

    this.toolbar = this.createToolbar();
    this.colorPicker = new ColorPicker(this.handleColorSelect.bind(this));
    this.screenRecorder = new ScreenRecorder();

    if (config?.integration) {
      this.integrationManager = new IntegrationManager(config.integration);
    }
    
    document.body.appendChild(this.toolbar);
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.id = 'qa-toolbar';
    toolbar.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: #ffffff !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 8px !important;
      padding: 8px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      display: flex !important;
      gap: 8px !important;
      z-index: 2147483647 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 16px !important;
      line-height: normal !important;
      box-sizing: border-box !important;
    `;

    const screenshotBtn = this.createToolbarButton('📸', 'Capture Screenshot');
    screenshotBtn.onclick = this.handleScreenshot.bind(this);

    this.recordButton = this.createToolbarButton('⏺️', 'Record Screen');
    this.recordButton.onclick = this.handleScreenRecording.bind(this);

    const reportBtn = this.createToolbarButton('🐛', 'Report Bug');
    reportBtn.onclick = this.handleBugReport.bind(this);

    toolbar.appendChild(screenshotBtn);
    toolbar.appendChild(this.recordButton);
    toolbar.appendChild(reportBtn);

    return toolbar;
  }

  private createToolbarButton(icon: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = icon;
    button.title = tooltip;
    button.style.cssText = `
      border: none !important;
      background: transparent !important;
      font-size: 20px !important;
      cursor: pointer !important;
      padding: 8px !important;
      border-radius: 4px !important;
      transition: background-color 0.2s !important;
      min-width: unset !important;
      min-height: unset !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      outline: none !important;
      box-shadow: none !important;
      text-transform: none !important;
      font-family: inherit !important;
      line-height: normal !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
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
      
      // Dynamically import screenshot function
      const { captureScreenshot } = await import('./services/screenshot');
      this.screenshot = await captureScreenshot();
      
      // Initialize annotator (keep toolbar hidden)
      this.showAnnotator();
    } catch (error) {
      console.error('Screenshot failed:', error);
      this.toolbar.style.display = 'flex';
      this.config?.callbacks?.onError?.(
        error instanceof Error ? error : new Error('Screenshot capture failed')
      );
    }
  }

  private async handleScreenRecording(): Promise<void> {
    if (this.screenRecorder.isActive()) {
      try {
        this.recordButton.innerHTML = '⏺️';
        this.recordButton.title = 'Record Screen';
        
        const videoBlob = await this.screenRecorder.stop();
        const url = URL.createObjectURL(videoBlob);
        
        this.screenRecordingData = {
          url,
          type: videoBlob.type,
          size: videoBlob.size
        };
        
        // Open bug report form automatically after recording
        this.handleBugReport();
      } catch (error) {
        console.error('Failed to stop recording:', error);
        this.config?.callbacks?.onError?.(
          error instanceof Error ? error : new Error('Failed to stop recording')
        );
      }
    } else {
      try {
        await this.screenRecorder.start();
        this.recordButton.innerHTML = '⏹️';
        this.recordButton.title = 'Stop Recording';
      } catch (error) {
        console.error('Failed to start recording:', error);
        this.config?.callbacks?.onError?.(
          error instanceof Error ? error : new Error('Failed to start recording')
        );
      }
    }
  }

  private async handleSubmit(report: BugReport): Promise<void> {
    try {
      // Submit to integration if configured
      if (this.integrationManager) {
        const result = await this.integrationManager.submitReport(report);
        if (!result.success) {
          throw new Error(result.error || 'Failed to submit report');
        }
      } else {
        console.log('No integration configured, skipping submission');
        console.log('Bug report:', report);  
      }

      // Call onSubmit callback if provided
      await this.config?.callbacks?.onSubmit?.(report);
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error; // Re-throw the error to be handled by the form
    }
  }

  private async handleBugReport(): Promise<void> {
    new BugReportForm(
      this.screenshot,
      this.screenRecordingData,
      null,
      this.handleSubmit.bind(this),
      { integration: this.config?.integration }
    );

    // Clear state when form is destroyed (happens on both cancel and submit)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.querySelector('form')) {
            this.screenshot = null;
            this.screenRecordingData = null;
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

    // Show the main toolbar again
    this.toolbar.style.display = 'flex';

    // Open the bug report form
    this.handleBugReport();
  }

  private showAnnotator(): void {
    if (!this.screenshot) return;

    // Keep main toolbar hidden by not showing it here
    
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

      // Show the main toolbar again
      this.toolbar.style.display = 'flex';
    };

    annotationToolbar.appendChild(mainTools);
    annotationToolbar.appendChild(cancelButton);

    container.insertBefore(annotationToolbar, canvasContainer);
    document.body.appendChild(container);
  }

  private createAnnotationButton(icon: string, tooltip: string, _mode: string): HTMLButtonElement {
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

export function init(config?: WidgetConfig) {
  // Check if we're in a browser environment
  if (!isClient) {
    console.warn('Exterminator Bar can only be initialized in a browser environment');
    return;
  }

  // Return a promise that resolves when the toolbar is initialized
  return new Promise<ExterminatorToolBarInternal>((resolve) => {
    // Ensure DOM is loaded before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        resolve(new ExterminatorToolBarInternal(config));
      });
    } else {
      resolve(new ExterminatorToolBarInternal(config));
    }
  });
}