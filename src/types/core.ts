export interface EnvironmentInfo {
  browser: string;
  browserVersion: string;
  os: string;
  screenResolution: string;
  viewport: {
    width: number;
    height: number;
  };
  userAgent: string;
  currentUrl: string;
}

export interface VisualFeedback {
  screenshot?: string; // Base64 encoded image
  screenRecording?: {
    url: string;
    type: string;
    size: number;
  };
  annotations: Array<{
    type: 'highlight' | 'arrow' | 'text';
    coordinates: {
      x: number;
      y: number;
      width?: number;
      height?: number;
    };
    color?: string;
    content?: string; // For text annotations
  }>;
  selectedElement?: {
    selector: string;
    xpath: string;
    elementInfo: {
      tagName: string;
      className?: string;
      id?: string;
      textContent?: string;
      attributes?: Record<string, string>;
    };
  };
}

export interface ReproductionSteps {
  steps: Array<{
    stepNumber: number;
    description: string;
    timestamp: string;
  }>;
  userActions?: Array<{
    action: 'click' | 'input' | 'navigation' | 'other';
    element?: string;
    value?: string;
    timestamp: string;
  }>;
}

export interface BugReport {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted' | 'in-review';
  url: string;
  createdAt: string;
  submittedBy?: string;
  
  // Related data
  environment: EnvironmentInfo;
  visualFeedback?: VisualFeedback;
  reproductionSteps: ReproductionSteps;
  
  // Optional fields that can be customized
  labels?: string[];
  customFields?: Record<string, unknown>;
  attachments?: Array<{
    type: string;
    content: string; // Base64 or URL
    name: string;
  }>;
}

export interface FormData {
  title?: string;
  description?: string;
  type?: BugReport['type'];
  severity?: BugReport['severity'];
  visualFeedback?: VisualFeedback;
  selectedElement?: VisualFeedback['selectedElement'];
  reproductionSteps: ReproductionSteps;
} 