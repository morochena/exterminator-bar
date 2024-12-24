---
sidebar_position: 2
---

# Linear Integration

Exterminator Bar integrates with Linear to streamline your bug tracking workflow. Bug reports can be automatically converted into Linear issues, complete with all relevant information and attachments.

## Setup

1. Generate a Linear API Key from your Linear workspace settings
2. Get your Team ID, Project ID, and Label IDs (see [Finding Your IDs](#finding-your-ids))
3. Initialize Exterminator Bar with your Linear configuration:

```typescript
import { init } from 'exterminator-bar';

init({
  integration: {
    type: 'linear',
    apiKey: 'lin_api_xxxxxxxxxxxx',
    teamId: '3093eeac-a23c-4e2a-955c-6db86ff69522',  // Example ID
    project: '3ece1aac-00bb-4ff5-8f35-d5dbab86c8a9',  // Example ID
    labelMap: {
      bug: '6bc9009b-849c-4785-8475-4d786be06cf2',      // Example ID
      improvement: '9bc4b656-b781-43d4-9007-4dd32a05fe26', // Example ID
      feature: '0602350d-c6b7-46d9-be98-4af237f035fe'     // Example ID
    }
  }
});
```

## Finding Your IDs

The easiest way to get your Team ID, Project ID, and Label IDs is to use the Linear GraphQL API Explorer:

1. Visit the [Linear API Explorer](https://studio.apollographql.com/public/Linear-API/variant/current/explorer)
2. Authenticate with your Linear API key
3. Run the following GraphQL query:

```graphql
query Teams {
  teams {
    nodes {
      id
      name
      labels {
        nodes {
          id
          name
        }
      }
      projects {
        nodes {
          id
          name
        }
      }
    }
  }
}
```

This query will return:
- Team IDs and names
- Project IDs and names for each team
- Label IDs and names for each team

Use these IDs to configure your integration as shown in the setup example above.

## Configuration Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | string | Yes | Your Linear API key |
| `teamId` | string | Yes | The ID of the team where issues will be created (from GraphQL query) |
| `project` | string | No | Project ID to associate issues with (from GraphQL query) |
| `labelMap` | object | No | Mapping of issue types to Linear label IDs (from GraphQL query) |
| `status` | string | No | Initial status for created issues (defaults to 'Backlog') |

### Label Mapping

The `labelMap` option allows you to map Exterminator Bar's issue types to your Linear labels:

```typescript
labelMap: {
  bug: 'your-bug-label-id',
  improvement: 'your-improvement-label-id',
  feature: 'your-feature-label-id'
}
```

## Issue Format

When a bug report is submitted, Exterminator Bar will create a Linear issue with:

- Title from the bug report
- Description including:
  - User-provided description
  - Browser and system information
  - URL where the bug was reported
  - Timestamp
- Attachments:
  - Screenshots (if captured) will be uploaded as issue attachments
  - Screen recordings (if captured) will be uploaded as issue attachments
- Labels based on your `labelMap` configuration

## Security Considerations

- Store your Linear API key securely
- Consider using environment variables or a secure backend to manage API keys
- Use team-specific API keys when possible instead of workspace-wide keys 