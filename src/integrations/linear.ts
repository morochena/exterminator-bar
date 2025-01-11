/**
 * Linear Integration for creating issues from bug reports.
 * 
 * Example configuration:
 * ```typescript
 * {
 *   type: 'linear',
 *   apiKey: 'lin_api_xxxxxxxxxxxx',     // Linear API Key
 *   teamId: 'TEAM_ID',                  // Linear Team ID
 *   status: 'Backlog',                  // Optional: Status name or UUID
 *   template: 'template_uuid',          // Optional: Issue template UUID
 *   project: 'Project Name',            // Optional: Project name or UUID
 *   projectMilestone: 'Milestone',      // Optional: Project milestone name or UUID
 *   cycle: 'Cycle 1',                   // Optional: Cycle number, name, or UUID
 *   estimate: 3,                        // Optional: Point estimate (0-21)
 *   labelMap: {                         // Optional: Map report types to Linear label UUIDs
 *     bug: 'bug-label-uuid',
 *     feature: 'feature-label-uuid',
 *     improvement: 'improvement-label-uuid',
 *     question: 'question-label-uuid'
 *   },
 *   priorityMap: {                      // Optional: Map severity to Linear priorities
 *     critical: 'urgent',
 *     high: 'high',
 *     medium: 'medium',
 *     low: 'low'
 *   }
 * }
 * ```
 */
import type { BugReport } from '../types';
import type { Integration, LinearConfig, IntegrationResponse } from '../types';

interface LinearIssueInput {
  title: string;
  description: string;
  teamId: string;
  priority: number;
  stateId?: string;
  templateId?: string;
  projectId?: string;
  projectMilestoneId?: string;
  cycleId?: string;
  estimate?: number;
  labelIds?: string[];
}

export class LinearIntegration implements Integration {
  private teamId: string;
  private token: string;
  private status?: string;
  private template?: string;
  private project?: string;
  private projectMilestone?: string;
  private cycle?: string;
  private estimate?: number;
  private labelMap?: Record<BugReport['type'], string>;
  private priorityMap?: Record<string, 'urgent' | 'high' | 'medium' | 'low'>;

  static getSetupInstructions(): string {
    return `
      <ol>
        <li>Go to Linear Settings > My Account > API Keys</li>
        <li>Create a new API key</li>
        <li>Copy the key and paste it below</li>
      </ol>
    `;
  }

  constructor(config: LinearConfig) {
    this.teamId = config.teamId;
    this.token = config.token;
    this.status = config.status;
    this.template = config.template;
    this.project = config.project;
    this.projectMilestone = config.projectMilestone;
    this.cycle = config.cycle ? String(config.cycle) : undefined;
    this.estimate = config.estimate;
    this.labelMap = config.labelMap;
    this.priorityMap = config.priorityMap;
  }

  async submit(report: BugReport): Promise<IntegrationResponse> {
    const token = localStorage.getItem('exterminator_linear_token') || this.token;
    try {
      const issueData = this.formatIssue(report);
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          query: `mutation CreateIssue($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                url
              }
            }
          }`,
          variables: {
            input: issueData
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Linear API error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return {
        success: true,
        data: data.data.issueCreate.issue
      };
    } catch (error) {
      // If unauthorized, clear the stored token
      if (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) {
        localStorage.removeItem('exterminator_linear_token');
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Linear issue'
      };
    }
  }

  private formatDescription(report: BugReport): string {
    const sections = [
      '## Environment',
      `- Browser: ${report.environment.browser} ${report.environment.browserVersion}`,
      `- OS: ${report.environment.os}`,
      `- Screen Resolution: ${report.environment.screenResolution}`,
      `- URL: ${report.environment.currentUrl}`,
      '',
      '## Description',
      report.description,
    ];

    if (report.visualFeedback?.screenshot) {
      sections.push(
        '',
        '## Screenshot',
        `![Screenshot](${report.visualFeedback.screenshot})`
      );
    }

    if (report.visualFeedback?.screenRecording) {
      sections.push(
        '',
        '## Screen Recording',
        report.visualFeedback.screenRecording.url
      );
    }

    if (report.visualFeedback?.selectedElement) {
      const element = report.visualFeedback.selectedElement;
      sections.push(
        '',
        '## Selected Element',
        '```',
        `Selector: ${element.selector}`,
        `XPath: ${element.xpath}`,
        'Element Info:',
        `- Tag: ${element.elementInfo.tagName}`,
        `- Class: ${element.elementInfo.className || 'N/A'}`,
        `- ID: ${element.elementInfo.id || 'N/A'}`,
        '```'
      );
    }

    if (report.customFields) {
      sections.push(
        '',
        '## Additional Information',
        ...Object.entries(report.customFields).map(([key, value]) => `- ${key}: ${value}`)
      );
    }

    return sections.join('\n');
  }

  private formatIssue(report: BugReport): LinearIssueInput {
    const priorityLevel = (this.priorityMap || {
      critical: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low',
      minor: 'low'
    })[report.severity] || 'medium';
    
    return {
      title: `[${report.severity.toUpperCase()}] ${report.title || report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}`,
      description: this.formatDescription(report),
      teamId: this.teamId,
      priority: this.getPriorityLevel(priorityLevel),
      ...(this.status && { stateId: this.status }),
      ...(this.template && { templateId: this.template }),
      ...(this.project && { projectId: this.project }),
      ...(this.projectMilestone && { projectMilestoneId: this.projectMilestone }),
      ...(this.cycle && { cycleId: this.cycle }),
      ...(this.estimate && { estimate: this.estimate }),
      ...(this.labelMap?.[report.type] && { labelIds: [this.labelMap[report.type]] })
    };
  }

  private getPriorityLevel(priority: string): number {
    const priorityMap: Record<string, number> = {
      'urgent': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    return priorityMap[priority] || 3;
  }
}