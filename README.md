# Web QA Widget

A lightweight, customizable widget for manual QA and bug reporting in web applications. Designed for development and testing environments, it helps testers and developers capture and document issues efficiently.

## Features

- **Visual Feedback**
  - Screenshot capture with browser-native tools
  - Visual annotation and highlighting

- **Issue Reporting**
  - Structured feedback form
  - Customizable fields for bug details
  - Environment data collection (browser, OS, etc.)
  - Steps to reproduce template

- **Integration Ready**
  - Framework agnostic
  - Configurable data submission
  - Supports custom backend integration
  - Lightweight with minimal dependencies

## Installation

```bash
npm install exterminator-bar
```

## Usage

```typescript
import { initBugTool } from 'exterminator-bar';

// Basic initialization
initBugTool();

// With configuration
initBugTool({
  position: 'right',
  theme: {
    primary: '#007bff',
    secondary: '#6c757d',
    text: '#212529',
    background: '#ffffff'
  },
  tools: {
    screenshot: {
      enabled: true,
      hotkey: 's',
      quality: 0.8
    },
    annotations: {
      enabled: true,
      defaultColor: '#ff0000',
      availableColors: ['#ff0000', '#00ff00', '#0000ff'],
      tools: ['highlight', 'arrow', 'text']
    }
  },
  form: {
    requiredFields: ['title', 'description', 'severity'],
    customFields: [
      {
        name: 'priority',
        type: 'select',
        options: ['low', 'medium', 'high'],
        required: true
      }
    ],
    labels: {
      available: ['bug', 'feature', 'improvement'],
      required: true,
      max: 3
    }
  },
  callbacks: {
    onSubmit: async (report) => {
      console.log('Bug report submitted:', report);
    },
    onError: (error) => {
      console.error('Error:', error);
    }
  }
});
```

### Integration Examples

The widget supports different backend integrations for submitting bug reports:

#### 1. Webhook Integration

```typescript
initBugTool({
  integration: {
    type: 'webhook',
    url: 'https://api.example.com/bugs',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-token',
      'X-Custom-Header': 'custom-value'
    },
    transformPayload: (report) => ({
      title: report.title,
      description: report.description,
      priority: report.severity,
      metadata: {
        browser: report.environment.browser,
        os: report.environment.os
      }
    })
  }
});
```

#### 2. GitHub Issues Integration

```typescript
initBugTool({
  integration: {
    type: 'github',
    owner: 'your-username',
    repo: 'your-repository-name',
    token: 'ghp_xxxxxxxxxxxx',  // GitHub Personal Access Token
    labels: ['bug', 'qa-widget', 'needs-triage']
  }
});
```

## Testing/Development
- Run `npm run dev` to start the development server
- Navigate to `http://localhost:5173/index.html` to see the widget in action

## Data Integrations

- [x] Custom JSON Webhook
- [x] GitHub Issues
- [ ] Slack
- [ ] Jira
- [ ] Linear
- [ ] Notion
- [ ] Google Sheets

## Important Notes

- This is a frontend-only tool - no backend included
- Not an error tracker/exception logger
- Focused on manual testing and bug reporting
- Ideal for QA teams and development environments

## License

MIT License