# Exterminator Bar 🐛

A lightweight, customizable widget for manual QA and bug reporting in web applications. Capture screenshots, record screen sessions, add annotations, and generate detailed bug reports without leaving the page.

- 📚 [View Documentation](https://morochena.github.io/exterminator-bar/)
- 📺 [View Demo](https://morochena.github.io/exterminator-bar/demo)

## Quick Start

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

## Features

- 📸 Screenshot capture with annotation tools (highlight, arrow, text)
- 🎥 Screen recording
- 📝 Customizable bug report forms
- 🔄 Multiple integration options (GitHub, Linear, Asana, Custom Webhook)
- 🎨 Simple, unobtrusive UI
- ⌨️ Error handling and callbacks

## Installation Options

### NPM Module (Recommended)
```typescript
import { init } from 'exterminator-bar';

init({
  // configuration options
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

## Configuration

### Core Options
```typescript
interface WidgetConfig {
  // Event callbacks
  callbacks?: {
    onSubmit?: (report: BugReport) => Promise<void>;
    onError?: (error: Error) => void;
  };

  // Integration configuration (see below)
  integration?: IntegrationConfig;
}
```

### Bug Report Structure
```typescript
interface BugReport {
  title: string;
  description: string;
  metadata: {
    userAgent: string;
    url: string;
    timestamp: string;
    [key: string]: any;
  };
  visualFeedback?: {
    screenshot?: {
      dataUrl: string;
      type: string;
      annotations?: Array<{
        type: 'highlight' | 'arrow' | 'text';
        coordinates: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        color: string;
        content?: string;
      }>;
    };
    screenRecording?: {
      url: string;
      type: string;
      size: number;
    };
  };
  customFields?: Record<string, any>;
}
```

## Integrations

### GitHub
```typescript
init({
  integration: {
    type: 'github',
    owner: 'your-username',
    repo: 'your-repo',
    token: 'your-github-token',
    labels: ['bug', 'needs-triage']
  }
});
```

### Linear
```typescript
init({
  integration: {
    type: 'linear',
    apiKey: 'lin_api_xxxxxxxxxxxx',
    teamId: 'TEAM_ID',
    status: 'Backlog',
    project: 'Project Name',
    labels: ['bug'],
    priorityMap: {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low'
    }
  }
});
```

### Asana
```typescript
init({
  integration: {
    type: 'asana',
    token: 'your-asana-token',
    projectId: 'project-id',
    tags: ['bug']
  }
});
```

### Custom Webhook
```typescript
init({
  integration: {
    type: 'webhook',
    url: 'https://your-api.com/bugs',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-token'
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

The core functionality requires `navigator.mediaDevices.getDisplayMedia` API support. Some features like `preferCurrentTab` for tab-specific capture are only available in newer browser versions:

- Chrome: 103+ (for `preferCurrentTab`)
- Firefox: 102+ (for `preferCurrentTab`)
- Edge: 103+ (for `preferCurrentTab`)

For older browsers, you may need to request full screen sharing permissions from users.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.