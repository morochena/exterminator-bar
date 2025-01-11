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
    project: 'project-id',
    defaultSection: 'section-id'
  }
});
```

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `token` | string | Yes | Your Asana Personal Access Token |
| `project` | string | Yes | The GID of the project where tasks will be created |
| `defaultSection` | string | No | Optional GID of a specific section within the project where tasks should be placed |

## Task Format

When a bug report is submitted, Exterminator Bar will create an Asana task with:

- Title derived from the bug report (using the title or first 80 characters of description)
- HTML-formatted description including:
  - User-provided description
  - Browser and system information (browser version, OS, screen resolution, user agent)
  - URL where the bug was reported
  - Any additional custom fields provided in the report
- Attachments:
  - Screenshots (if captured) will be uploaded as task attachments
  - Screen recordings (if captured) will be uploaded as task attachments

## Finding Your Asana IDs

### Project GID
1. Open your project in Asana
2. The GID is the number in the URL after /0/
   Example: `https://app.asana.com/0/123456789/list` (here, `123456789` is your project GID)

### Section GID
1. Open your project and locate the section
2. The section GID can be found in the URL when viewing or editing the section
3. It's typically a long numeric string similar to the project GID

## Security Considerations

- Store your Asana token securely
- Consider using environment variables or a secure backend to manage tokens
- Use the minimum required permissions for your Personal Access Token
- Regularly rotate your access tokens 