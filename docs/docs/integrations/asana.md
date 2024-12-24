# Asana

Exterminator Bar can automatically create Asana tasks from bug reports, helping teams that use Asana for project management to track and manage reported issues efficiently.

## Setup

1. Generate an Asana Personal Access Token from your Account Settings
2. Initialize Exterminator Bar with your Asana configuration:

```typescript
import { init } from 'exterminator-bar';

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

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `token` | string | Yes | Your Asana Personal Access Token |
| `projectId` | string | Yes | The ID of the project where tasks will be created |
| `workspace` | string | Yes | The ID of your Asana workspace |
| `tags` | string[] | No | Array of tags to automatically add to created tasks |

## Task Format

When a bug report is submitted, Exterminator Bar will create an Asana task with:

- Name (title) from the bug report
- Description including:
  - User-provided description
  - Browser and system information
  - URL where the bug was reported
  - Timestamp
- Attachments:
  - Screenshots (if captured) will be uploaded as task attachments
  - Screen recordings (if captured) will be uploaded as task attachments
- Tags as specified in your configuration

## Finding Your Asana IDs

### Workspace ID
1. Go to your Asana workspace in a web browser
2. The URL will be in the format: `https://app.asana.com/0/workspace/{WORKSPACE_ID}/...`
3. Copy the `WORKSPACE_ID` from the URL

### Project ID
1. Open your project in Asana
2. The URL will be in the format: `https://app.asana.com/0/{PROJECT_ID}/list`
3. Copy the `PROJECT_ID` from the URL

## Security Considerations

- Store your Asana token securely
- Consider using environment variables or a secure backend to manage tokens
- Use the minimum required permissions for your Personal Access Token
- Regularly rotate your access tokens 