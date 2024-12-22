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
import type { Integration, GithubConfig, IntegrationResponse } from './types';

export class GithubIntegration implements Integration {
  private baseUrl = 'https://api.github.com';

  constructor(private config: GithubConfig) {
    if (!config.owner || !config.repo || !config.token) {
      throw new Error('GitHub owner, repo, and token are required');
    }
  }

  async submit(report: BugReport): Promise<IntegrationResponse> {
    try {
      const issueData = this.formatIssue(report);
      const response = await fetch(
        `${this.baseUrl}/repos/${this.config.owner}/${this.config.repo}/issues`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.config.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(issueData)
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private formatIssue(report: BugReport): {
    title: string;
    body: string;
    labels: string[];
  } {
    const labels = [...(this.config.labels || [])];
    labels.push(report.severity);
    labels.push(report.type);

    const body = this.generateIssueBody(report);

    return {
      title: report.title,
      body,
      labels
    };
  }

  private generateIssueBody(report: BugReport): string {
    const sections = [
      this.formatSection('Description', report.description),
      this.formatSection('Environment', this.formatEnvironment(report.environment)),
      this.formatSection('Steps to Reproduce', this.formatReproductionSteps(report.reproductionSteps)),
    ];

    if (report.visualFeedback?.screenshot) {
      sections.push(this.formatSection('Screenshot', `![Screenshot](${report.visualFeedback.screenshot})`));
    }

    if (report.visualFeedback?.selectedElement) {
      sections.push(this.formatSection('Selected Element', this.formatSelectedElement(report.visualFeedback.selectedElement)));
    }

    return sections.join('\n\n');
  }

  private formatSection(title: string, content: string): string {
    return `### ${title}\n${content}`;
  }

  private formatEnvironment(env: BugReport['environment']): string {
    return [
      `- Browser: ${env.browser} ${env.browserVersion}`,
      `- OS: ${env.os}`,
      `- Screen Resolution: ${env.screenResolution}`,
      `- Viewport: ${env.viewport.width}x${env.viewport.height}`,
      `- URL: ${env.currentUrl}`
    ].join('\n');
  }

  private formatReproductionSteps(steps: BugReport['reproductionSteps']): string {
    return steps.steps
      .map(step => `${step.stepNumber}. ${step.description}`)
      .join('\n');
  }

  private formatSelectedElement(element: NonNullable<BugReport['visualFeedback']>['selectedElement']): string {
    if (!element) return 'No element selected';
    
    return [
      '```',
      `Selector: ${element.selector}`,
      `XPath: ${element.xpath}`,
      'Element Info:',
      `- Tag: ${element.elementInfo.tagName}`,
      `- Class: ${element.elementInfo.className || 'N/A'}`,
      `- ID: ${element.elementInfo.id || 'N/A'}`,
      '```'
    ].join('\n');
  }
} 