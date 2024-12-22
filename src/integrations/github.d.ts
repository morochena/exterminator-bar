/**
 * GitHub Issues Integration for creating issues from bug reports.
 *
 * Example configuration:
 * ```typescript
 * {
 *   type: 'github',
 *   owner: 'your-username',        // GitHub username or organization
 *   repo: 'your-repository-name',  // Repository name
 *   token: 'ghp_xxxxxxxxxxxx',     // GitHub Personal Access Token with 'repo' scope
 *   labels: [                      // Optional custom labels to add
 *     'bug',
 *     'qa-widget',
 *     'needs-triage'
 *   ]
 * }
 * ```
 *
 * Note: The integration will automatically add the report's severity and type as labels.
 * For example, if the report has severity 'high' and type 'bug', these will be added
 * as labels in addition to any custom labels specified in the config.
 *
 * To get a GitHub token:
 * 1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
 * 2. Generate a new token with 'repo' scope
 * 3. Copy the token and store it securely
 */
import type { BugReport } from '../types';
import type { Integration, GithubConfig, IntegrationResponse } from '../types';
export declare class GithubIntegration implements Integration {
    private config;
    private baseUrl;
    constructor(config: GithubConfig);
    submit(report: BugReport): Promise<IntegrationResponse>;
    private formatIssue;
    private generateIssueBody;
    private formatSection;
    private formatEnvironment;
    private formatReproductionSteps;
    private formatSelectedElement;
}
