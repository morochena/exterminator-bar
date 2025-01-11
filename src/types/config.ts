import type { BugReport } from './core';
import type { IntegrationConfig } from './integrations';

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
    screenRecording?: {
      enabled: boolean;
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