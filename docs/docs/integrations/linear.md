# Linear

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
    token: 'lin_api_xxxxxxxxxxxx',
    teamId: 'TEAM_ID',
    status: 'Todo',
    template: 'TEMPLATE_ID',
    project: 'PROJECT_ID',
    projectMilestone: 'MILESTONE_ID',
    cycle: 'CYCLE_ID',
    estimate: 2,
    labelMap: {
      bug: 'Bug',
      feature: 'Feature Request',
      improvement: 'Enhancement'
    },
    priorityMap: {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low'
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
| `token` | string | Yes | Your Linear API key |
| `teamId` | string | Yes | The ID of your Linear team |
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