---
sidebar_position: 4
---

# Custom Webhook Integration

For maximum flexibility, Exterminator Bar supports custom webhook integrations. This allows you to send bug reports to any endpoint of your choice, making it compatible with any bug tracking or project management system.

## Setup

Initialize Exterminator Bar with your webhook configuration:

```typescript
import { init } from 'exterminator-bar';

init({
  integration: {
    type: 'webhook',
    url: 'https://your-api.com/bugs',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-token',
      'Content-Type': 'application/json'
    }
  }
});
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `url` | string | Yes | The endpoint URL where bug reports will be sent |
| `method` | string | No | HTTP method to use (defaults to 'POST') |
| `headers` | object | No | Custom headers to include with the request |

## Request Format

When a bug report is submitted, Exterminator Bar will send a request to your webhook with the following structure:

```typescript
{
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

## Example Implementations

### Basic Express.js Server
```typescript
import express from 'express';
const app = express();

app.post('/bugs', (req, res) => {
  const bugReport = req.body;
  // Process the bug report
  console.log('Received bug report:', bugReport);
  res.status(200).json({ message: 'Bug report received' });
});
```

### AWS Lambda Function
```typescript
export const handler = async (event) => {
  const bugReport = JSON.parse(event.body);
  // Process the bug report
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Bug report received' })
  };
};
```

## Security Considerations

- Use HTTPS endpoints only
- Implement proper authentication (e.g., API keys, JWT tokens)
- Validate incoming requests on your server
- Consider rate limiting to prevent abuse
- Handle file uploads securely if processing screenshots or recordings 