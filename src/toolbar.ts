import { ScreenRecorder } from './services/screenRecorder';
import { Annotator } from './services/annotator';
import { BugReportForm } from './components/BugReportForm';
import { ColorPicker } from './components/ColorPicker';
import { IntegrationManager } from './integrations/manager';
import type { BugReport, VisualFeedback, IntegrationConfig } from './types';
import './styles/main.css';

// Utility to check if we're in a browser environment
const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

export interface WidgetConfig {
  tools?: {
    screenshot?: {
      enabled?: boolean;
      hotkey?: string;
    };
    screenRecording?: {
      enabled?: boolean;
      hotkey?: string;
    };
  };
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

    if (config?.tools?.screenshot?.hotkey || config?.tools?.screenRecording?.hotkey) {
      this.setupHotkeys();
    }
  }

  private setupHotkeys(): void {
    document.addEventListener('keydown', (event) => {
      // Convert event to hotkey string format (e.g., "Ctrl+Shift+S")
      const pressedHotkey = this.getHotkeyString(event);
      
      // Check if it matches screenshot hotkey
      if (this.config?.tools?.screenshot?.hotkey === pressedHotkey) {
        event.preventDefault();
        this.handleScreenshot();
      }
      
      // Check if it matches screen recording hotkey
      if (this.config?.tools?.screenRecording?.hotkey === pressedHotkey) {
        event.preventDefault();
        this.handleScreenRecording();
      }
    });
  }

  private getHotkeyString(event: KeyboardEvent): string {
    const modifiers: string[] = [];
    
    if (event.ctrlKey || event.metaKey) modifiers.push('Ctrl');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.altKey) modifiers.push('Alt');
    
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    
    return [...modifiers, key].join('+');
  }

  private createToolbar(): HTMLElement {
    const toolbar = document.createElement('div');
    toolbar.id = 'qa-toolbar';
    toolbar.className = 'fixed bottom-5 right-5 bg-white border border-gray-200 rounded-lg p-2 shadow-lg flex gap-2 z-[2147483647] font-sans text-base';

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
    button.className = 'border-none bg-transparent text-xl cursor-pointer p-2 rounded hover:bg-gray-100 transition-colors flex items-center justify-center';
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
    
    const container = document.createElement('div');
    container.className = 'fixed inset-0 bg-black/80 z-[10001] flex flex-col p-2.5';

    const annotationToolbar = document.createElement('div');
    annotationToolbar.className = 'flex gap-2.5 mb-2.5 bg-white p-2 rounded justify-between items-center';

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'flex-1 flex justify-center items-center overflow-hidden m-0 p-0 bg-gray-800';
    container.appendChild(canvasContainer);

    this.annotator = new Annotator(canvasContainer, this.screenshot);

    const mainTools = document.createElement('div');
    mainTools.className = 'flex gap-2.5';

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

      if (tool.mode !== 'color' && tool.mode !== 'done') {
        this.annotator?.registerToolbarButton(tool.mode, button);
      }
    });

    const cancelButton = this.createAnnotationButton('❌', 'Cancel', 'cancel');
    cancelButton.onclick = () => {
      this.annotator?.destroy();
      this.annotator = null;
      this.screenshot = null;
      container.remove();
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
    button.className = 'border border-gray-200 bg-white text-xl cursor-pointer p-2 rounded min-w-[40px] flex items-center justify-center transition-all hover:bg-gray-50';
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