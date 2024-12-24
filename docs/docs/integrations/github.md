---
sidebar_position: 1
---

# GitHub Integration

Exterminator Bar can automatically create GitHub issues from bug reports. This integration allows your team to seamlessly track and manage reported bugs in your GitHub repository.

## Setup

1. Generate a GitHub Personal Access Token with the following permissions:
   - `repo` scope for private repositories
   - `public_repo` scope for public repositories

2. Initialize Exterminator Bar with your GitHub configuration:

```typescript
import { init } from 'exterminator-bar';

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

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `owner` | string | Yes | The GitHub username or organization name that owns the repository |
| `repo` | string | Yes | The name of the repository where issues will be created |
| `token` | string | Yes | Your GitHub Personal Access Token |
| `labels` | string[] | No | Array of labels to automatically add to created issues |

## Issue Format

When a bug report is submitted, Exterminator Bar will create a GitHub issue with:

- Title from the bug report
- Description including:
  - User-provided description
  - Browser and system information
  - URL where the bug was reported
  - Timestamp
- Attachments:
  - Screenshots (if captured) will be uploaded as issue attachments
  - Screen recordings (if captured) will be uploaded as issue attachments
- Labels as specified in your configuration

## Security Considerations

- Never expose your GitHub token in client-side code
- Consider using environment variables or a secure backend to manage tokens
- Use the minimum required permissions for your Personal Access Token 