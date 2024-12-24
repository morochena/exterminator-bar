---
sidebar_position: 2
---

# API Reference

## Configuration

### Core Options
```typescript
interface WidgetConfig {
  // Event callbacks
  callbacks?: {
    onSubmit?: (report: BugReport) => Promise<void>;
    onError?: (error: Error) => void;
  };

  // Integration configuration
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

## Integration Options

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
    workspace: 'workspace-id',
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