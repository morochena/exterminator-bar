import type { IntegrationConfig } from '../integrations/types';

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
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'improvement' | 'question';
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

export interface WidgetConfig {
  position: 'left' | 'right';
  theme?: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  tools?: {
    screenshot?: {
      enabled: boolean;
      hotkey?: string;
      quality?: number; // 0-1
    };
    elementPicker?: {
      enabled: boolean;
      highlightColor?: string;
      hotkey?: string;
    };
    annotations?: {
      enabled: boolean;
      defaultColor?: string;
      availableColors?: string[];
      tools?: Array<'highlight' | 'arrow' | 'text'>;
    };
  };
  form?: {
    requiredFields: Array<keyof BugReport>;
    customFields?: Array<{
      name: string;
      type: 'text' | 'number' | 'select' | 'boolean';
      options?: string[]; // For select type
      required: boolean;
    }>;
    labels?: {
      available: string[];
      required: boolean;
      max?: number;
    };
  };
  integration?: IntegrationConfig;
  callbacks?: {
    onSubmit?: (report: BugReport) => Promise<void>;
    onScreenshot?: (screenshot: string) => void;
    onError?: (error: Error) => void;
  };
} 