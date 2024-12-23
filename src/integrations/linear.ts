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

export class LinearIntegration implements Integration {
  private baseUrl = 'https://api.linear.app/graphql';
  private defaultPriorityMap: Record<string, 'urgent' | 'high' | 'medium' | 'low'> = {
    critical: 'urgent',
    high: 'high',
    medium: 'medium',
    low: 'low',
    minor: 'low'
  };

  constructor(private config: LinearConfig) {
    if (!config.apiKey || !config.teamId) {
      throw new Error('Linear API key and team ID are required');
    }
  }

  private async createIssue(title: string, description: string, priority: string, type: BugReport['type']): Promise<any> {
    const priorityLevel = (this.config.priorityMap || this.defaultPriorityMap)[priority] || 'medium';
    
    const mutation = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            url
            title
            priority
            estimate
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const labelId = this.config.labelMap?.[type];
    const labelIds = labelId ? [labelId] : undefined;

    const variables = {
      input: {
        title,
        description,
        teamId: this.config.teamId,
        priority: this.getPriorityLevel(priorityLevel),
        ...(this.config.status && { stateId: this.config.status }),
        ...(this.config.template && { templateId: this.config.template }),
        ...(this.config.project && { projectId: this.config.project }),
        ...(this.config.projectMilestone && { projectMilestoneId: this.config.projectMilestone }),
        ...(this.config.cycle && { cycleId: this.config.cycle }),
        ...(this.config.estimate && { estimate: this.config.estimate }),
        ...(labelIds && { labelIds })
      }
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.config.apiKey,
        'Linear-Client': 'exterminator-bar'
      },
      body: JSON.stringify({
        query: mutation,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`Linear API error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.issueCreate;
  }

  private getPriorityLevel(priority: string): number {
    const priorityMap = {
      'urgent': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    return priorityMap[priority as keyof typeof priorityMap] || 3;
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

    if (report.reproductionSteps?.steps.length > 0) {
      sections.push(
        '',
        '## Steps to Reproduce',
        ...report.reproductionSteps.steps.map(step => `${step.stepNumber}. ${step.description}`)
      );
    }

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

  async submit(report: BugReport): Promise<IntegrationResponse> {
    try {
      const title = `[${report.severity.toUpperCase()}] ${report.title || report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}`;
      const description = this.formatDescription(report);
      
      const response = await this.createIssue(title, description, report.severity, report.type);
      
      return {
        success: true,
        data: {
          issueId: response.issue.identifier,
          issueUrl: response.issue.url,
          title: response.issue.title,
          priority: response.issue.priority,
          estimate: response.issue.estimate,
          labels: response.issue.labels.nodes
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Linear issue'
      };
    }
  }
} 