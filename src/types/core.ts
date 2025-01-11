import type { IntegrationConfig } from './integrations';

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

export interface BugReport {
  id: string;
  title: string;
  description: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'submitted' | 'in_progress' | 'resolved';
  url: string;
  createdAt: string;
  submittedBy?: string;
  
  // Related data
  environment: EnvironmentInfo;
  visualFeedback?: VisualFeedback;
  
  // Optional fields that can be customized
  labels?: string[];
  customFields?: Record<string, string>;
  attachments?: Array<{
    type: string;
    content: string; // Base64 or URL
    name: string;
  }>;
  config?: { integration?: IntegrationConfig };
}

export interface FormData {
  title?: string;
  description?: string;
  type?: BugReport['type'];
  severity?: BugReport['severity'];
  visualFeedback?: VisualFeedback;
  selectedElement?: VisualFeedback['selectedElement'];
} 