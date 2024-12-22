# Exterminator Bar 🐛

A lightweight, customizable widget for manual QA and bug reporting in web applications. Capture screenshots, record screen sessions, add annotations, and collect detailed bug reports with ease.

## Features

- 📸 Screenshot capture with annotation tools
- 🎥 Screen recording
- 📝 Customizable bug report forms
- 🔄 Multiple integration options
- 🎨 Themeable UI
- ⌨️ Configurable hotkeys

## Integrations
**Important:** Note that this package does not include a standalone backend, it only includes the widget and the configurable integrations. If an integration is not configured, it will simply log the report to the console.

- [x] Custom JSON Webhook
- [x] GitHub
- [ ] Asana
- [ ] Jira
- [ ] Linear
- [ ] Slack
- [ ] Azure DevOps

## Installation

### NPM Package

```bash
npm install exterminator-bar
# or
yarn add exterminator-bar
# or
pnpm add exterminator-bar
```

### CDN

```html
<!-- Using unpkg -->
<script src="https://unpkg.com/exterminator-bar@0.1.8/dist/index.umd.js"></script>

<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/exterminator-bar@0.1.8/dist/index.umd.js"></script>
```

Then initialize the widget:

```html
<script>
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ExterminatorBar === 'undefined') {
      console.error('ExterminatorBar failed to load');
      return;
    }

    // Initialize using init function
    window.ExterminatorBar.init({
      // add options below
      callbacks: {
        onSubmit: async (report) => {
          console.log('Bug report submitted:', report);
        },
        onError: (error) => {
          console.error('Error occurred:', error);
        }
      }
    });
  });
</script>
```

## Usage

### ES Modules

```typescript
import { ExterminatorBar } from 'exterminator-bar';

const bugReporter = new ExterminatorBar({
  position: 'right',
  theme: {
    primary: '#FF4444',
    secondary: '#333333',
    text: '#FFFFFF',
    background: '#FFFFFF'
  },
  tools: {
    screenshot: {
      enabled: true,
      hotkey: 'ctrl+shift+s'
    },
    screenRecording: {
      enabled: true,
      hotkey: 'ctrl+shift+r'
    },
    annotations: {
      enabled: true,
      tools: ['highlight', 'arrow', 'text']
    }
  }
});
```

### CommonJS

```javascript
const { ExterminatorBar } = require('exterminator-bar');

const bugReporter = new ExterminatorBar({
  // configuration options
});
```

### Browser Script Tag

```html
<script src="https://unpkg.com/exterminator-bar"></script>
<script>
  const bugReporter = new ExterminatorBar({
    // configuration options
  });
</script>
```

### Browser ES Modules

```html
<script type="module">
  import { ExterminatorBar } from 'https://unpkg.com/exterminator-bar?module';
  
  const bugReporter = new ExterminatorBar({
    // configuration options
  });
</script>
```

## Configuration Options

```typescript
interface WidgetConfig {
  // Position of the widget button
  position?: 'left' | 'right';
  
  // Theme customization
  theme?: {
    primary: string;    // Primary color for buttons and accents
    secondary: string;  // Secondary color for UI elements
    text: string;      // Text color
    background: string; // Background color
  };
  
  // Tool configurations
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
  
  // Form customization
  form?: {
    requiredFields?: string[];
    customFields?: Array<{
      name: string;
      type: 'text' | 'number' | 'select' | 'boolean';
      options?: string[];
      required?: boolean;
    }>;
  };
  
  // Integration settings
  integration?: {
    // GitHub integration
    type: 'github';
    owner: string;
    repo: string;
    token: string;
    labels?: string[];
  } | {
    // Webhook integration
    type: 'webhook';
    url: string;
    method?: 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
  };
}
```

## Integration Examples

### GitHub Integration

```typescript
const bugReporter = new ExterminatorBar({
  integration: {
    type: 'github',
    owner: 'your-username',
    repo: 'your-repo',
    token: 'your-github-token',
    labels: ['bug', 'needs-triage']
  }
});
```

### Webhook Integration

```typescript
const bugReporter = new ExterminatorBar({
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

## Events and Callbacks

```typescript
const bugReporter = new ExterminatorBar({
  callbacks: {
    onSubmit: async (report) => {
      console.log('Bug report submitted:', report);
      // Custom handling of the report
    },
    onError: (error) => {
      console.error('Error occurred:', error);
      // Custom error handling
    }
  }
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Releasing

This package uses GitHub Actions for automated releases. To publish a new version:

1. Update the version in `package.json`
2. Create and push a new tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. Create a new release on GitHub using the tag
4. The GitHub Action will automatically:
   - Run tests
   - Build the package
   - Publish to npm
   - Publish to GitHub Packages

### Setting up NPM Token

To enable automated publishing, you need to add your NPM token to GitHub Secrets:

1. Create an NPM access token with publish permissions
2. Go to your GitHub repository settings
3. Navigate to Secrets and Variables > Actions
4. Add a new secret named `NPM_TOKEN` with your NPM access token

## License

MIT License - see the [LICENSE](LICENSE) file for details.