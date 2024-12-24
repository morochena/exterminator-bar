# Integrations

:::warning Security Considerations

Exterminator Bar is designed for internal QA environments, not public websites. Please consider the following security implications:

1. **Token Exposure**: Any API tokens or secrets provided in the configuration will be visible to users through browser developer tools. Never use tokens with broad permissions.

2. **Recommended Setup**:
   - Create dedicated service accounts with minimal permissions
   - Use tokens that can only create issues/tickets
   - Consider implementing a proxy service that handles the actual integration
   - Restrict access to QA environments where Exterminator Bar is enabled

3. **Secure Alternative**: Instead of using built-in integrations with sensitive tokens, use the custom callback approach with your own backend:

```typescript
init({
  callbacks: {
    onSubmit: async (report) => {
      // Send to your secure backend
      await fetch('https://your-internal-api.com/bugs', {
        method: 'POST',
        body: JSON.stringify(report),
        // Use session cookies or other secure authentication
        credentials: 'include'
      });
    }
  }
});
```

This way, your backend can handle the integration with issue tracking systems securely, without exposing any tokens to the client.
:::

Exterminator Bar provides two approaches to handle bug reports: custom callbacks and built-in integrations.

## Custom Callbacks

The simplest way to handle bug reports is by implementing the `onSubmit` and `onError` callbacks. This gives you complete control over how reports are processed and where they are sent.

```typescript
init({
  callbacks: {
    onSubmit: async (report: BugReport) => {
      // Handle the bug report
      await yourApi.createBugReport(report);
    },
    onError: (error: Error) => {
      // Handle any errors that occur
      console.error('Error submitting bug report:', error);
      notifyUser('Failed to submit bug report');
    }
  }
});
```

The `BugReport` object contains all the information collected, including:
- Title and description
- Screenshots with annotations
- Screen recordings
- Browser metadata
- Custom form fields
- Labels

## Built-in Integrations

For convenience, Exterminator Bar provides built-in integrations with popular issue tracking systems. These can be configured using the `integration` option. For example:

### GitHub Issues

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

### Custom Webhook

For other issue tracking systems, you can use the webhook integration to send reports to your own API endpoint:

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
