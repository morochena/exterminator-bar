---
sidebar_position: 1
---

# Introduction

Exterminator Bar is a lightweight, customizable widget for manual QA and bug reporting in web applications. It allows you to capture screenshots, record screen sessions, add annotations, and generate detailed bug reports without leaving the page.

## Features

- 📸 Screenshot capture with annotation tools (highlight, arrow, text)
- 🎥 Screen recording
- 📝 Customizable bug report forms
- 🔄 Multiple integration options (GitHub, Linear, Asana, Custom Webhook)
- 🎨 Simple, unobtrusive UI
- ⌨️ Error handling and callbacks

## Quick Start

### NPM Module (Recommended)
```bash
# Install via your package manager
npm install exterminator-bar
# or yarn add exterminator-bar
# or pnpm add exterminator-bar
```

```typescript
import { init } from 'exterminator-bar';

// Initialize with basic configuration
init({
  callbacks: {
    onSubmit: async (report) => {
      console.log('Bug report submitted:', report);
    }
  }
});
```

### CDN
```html
<script src="https://unpkg.com/exterminator-bar@latest/dist/index.umd.js"></script>
<script>
  window.ExterminatorBar.init({
    // configuration options
  });
</script>
```



## Configuration Options

You can customize Exterminator Bar's behavior and appearance through the configuration object:

```typescript
interface WidgetConfig {
  // Widget position on the screen
  position: 'left' | 'right';

  // Theme customization
  theme?: {
    primary: string;    // Primary color
    secondary: string;  // Secondary color
    text: string;      // Text color
    background: string; // Background color
  };

  // Tool configurations
  tools?: {
    // Screenshot tool settings
    screenshot?: {
      enabled: boolean;
      hotkey?: string;
      quality?: number; // 0-1
    };

    // Screen recording settings
    screenRecording?: {
      enabled: boolean;
      hotkey?: string;
    };

    // Annotation tools settings
    annotations?: {
      enabled: boolean;
      defaultColor?: string;
      availableColors?: string[];
      tools?: Array<'highlight' | 'arrow' | 'text'>;
    };
  };

  // Form customization
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

  // Event callbacks
  callbacks?: {
    onSubmit?: (report: BugReport) => Promise<void>;
    onScreenshot?: (screenshot: string) => void;
    onError?: (error: Error) => void;
  };
}
```

### Example Configuration

```typescript
init({
  position: 'right',
  theme: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    text: '#1f2937',
    background: '#ffffff'
  },
  tools: {
    screenshot: {
      enabled: true,
      hotkey: 'ctrl+shift+s',
      quality: 0.8
    },
    screenRecording: {
      enabled: true,
      hotkey: 'ctrl+shift+r'
    },
    annotations: {
      enabled: true,
      defaultColor: '#ff0000',
      availableColors: ['#ff0000', '#00ff00', '#0000ff'],
      tools: ['highlight', 'arrow', 'text']
    }
  },
  form: {
    requiredFields: ['title', 'description'],
    customFields: [
      {
        name: 'severity',
        type: 'select',
        options: ['low', 'medium', 'high', 'critical'],
        required: true
      },
      {
        name: 'reproducible',
        type: 'boolean',
        required: true
      }
    ],
    labels: {
      available: ['bug', 'ui', 'feature'],
      required: true,
      max: 2
    }
  },
  callbacks: {
    onSubmit: async (report) => {
      await submitToBackend(report);
    },
    onError: (error) => {
      console.error('Error in Exterminator Bar:', error);
    }
  }
});
```

## Browser Compatibility

Exterminator Bar uses modern browser APIs for screen capture and recording. Here are the minimum browser versions required:

- Chrome: 72+
- Firefox: 66+
- Edge: 79+ (Chromium-based)
- Safari: 13+
- Opera: 60+

The core functionality requires `navigator.mediaDevices.getDisplayMedia` API support.