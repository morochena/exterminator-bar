import type { BugReport } from '../types';
import type { Integration, IntegrationResponse, AsanaConfig } from '../types';

export class AsanaIntegration implements Integration {
  private token: string;
  private workspace: string;
  private project: string;
  private defaultSection?: string;

  constructor(config: AsanaConfig) {
    this.token = config.token;
    this.workspace = config.workspace;
    this.project = config.project;
    this.defaultSection = config.defaultSection;
  }

  private async createTask(title: string, description: string): Promise<any> {
    const response = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: title,
          notes: description,
          workspace: this.workspace,
          projects: [this.project],
          ...(this.defaultSection && { memberships: [{ section: this.defaultSection }] }),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Asana task: ${response.statusText}`);
    }

    return response.json();
  }

  private formatDescription(report: BugReport): string {
    const sections = [
      '## Bug Report\n',
      `**URL:** ${report.url}`,
      `**Environment:**`,
      `- Browser: ${report.environment.browser} ${report.environment.browserVersion}`,
      `- OS: ${report.environment.os}`,
      `- Screen Resolution: ${report.environment.screenResolution}`,
      `- User Agent: ${report.environment.userAgent}`,
      `\n**Description:**\n${report.description}`,
    ];

    if (report.visualFeedback?.screenshot) {
      sections.push(`\n**Screenshot:** ${report.visualFeedback.screenshot}`);
    }

    if (report.visualFeedback?.screenRecording) {
      sections.push(`\n**Screen Recording:** ${report.visualFeedback.screenRecording.url}`);
    }

    if (report.reproductionSteps?.steps.length > 0) {
      sections.push('\n**Reproduction Steps:**');
      report.reproductionSteps.steps.forEach(step => {
        sections.push(`${step.stepNumber}. ${step.description}`);
      });
    }

    if (report.customFields) {
      sections.push('\n**Additional Information:**');
      Object.entries(report.customFields).forEach(([key, value]) => {
        sections.push(`- ${key}: ${value}`);
      });
    }

    return sections.join('\n');
  }

  async submit(report: BugReport): Promise<IntegrationResponse> {
    try {
      const title = `[${report.severity.toUpperCase()}] ${report.title || report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}`;
      const description = this.formatDescription(report);
      
      const response = await this.createTask(title, description);
      
      return {
        success: true,
        data: {
          taskId: response.data.gid,
          taskUrl: `https://app.asana.com/0/${this.project}/${response.data.gid}`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Asana task',
      };
    }
  }
} 