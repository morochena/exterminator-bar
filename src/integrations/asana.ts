/**
 * Asana Integration for creating tasks from bug reports.
 * 
 * Example configuration:
 * ```typescript
 * {
 *   type: 'asana',
 *   token: 'your-asana-token',     // Asana Personal Access Token
 *   project: '1234567890',         // Asana Project GID
 *   defaultSection: '1234567890'   // Optional: Section GID to place tasks in
 * }
 * ```
 * 
 * The integration will create a task in the specified project with:
 * - A formatted description including all bug report details
 * - Automatic upload of screenshots and screen recordings as attachments
 * - Optional placement in a specific section if defaultSection is provided
 * 
 * To get an Asana token:
 * 1. Go to Asana Settings > Apps > Developer Apps > Manage Developer Apps
 * 2. Create a new app or use an existing one
 * 3. Create a Personal Access Token
 * 4. Copy the token and store it securely
 * 
 * To get Project/Section GIDs:
 * 1. Open the project/section in Asana
 * 2. The GID is the number in the URL after /0/
 */

import type { BugReport } from '../types';
import type { Integration, IntegrationResponse, AsanaConfig } from '../types';

export class AsanaIntegration implements Integration {
  private token: string;
  private project: string;
  private defaultSection?: string;

  constructor(config: AsanaConfig) {
    this.token = config.token;
    this.project = config.project;
    this.defaultSection = config.defaultSection;
  }  

  async submit(report: BugReport): Promise<IntegrationResponse> {
    try {
      const title = `${report.title || report.description.slice(0, 80)}${report.description.length > 80 ? '...' : ''}`;
      const description = this.formatDescription(report);
      
      const response = await this.createTask(title, description);
      const taskId = response.data.gid;
      const taskUrl = `https://app.asana.com/0/${this.project}/${taskId}`;

      // Upload attachments if present
      if (report.visualFeedback?.screenshot) {
        await this.uploadAttachment(taskId, report.visualFeedback.screenshot);
      }

      if (report.visualFeedback?.screenRecording?.url) {
        await this.uploadAttachment(taskId, report.visualFeedback.screenRecording.url);
      }
      
      return {
        success: true,
        data: {
          taskId,
          taskUrl,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Asana task',
      };
    }
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
          html_notes: description,
          projects: [this.project],
          ...(this.defaultSection && { memberships: [{ project: this.project, section: this.defaultSection }] }), 
        },
      }),
    });

    if (!response.ok) {
      console.error(await response.json());
      throw new Error(`Failed to create Asana task: ${response.statusText}`);
    }

    return response.json();
  }

  private formatDescription(report: BugReport): string {
    const sections = [
      '<h1>Bug Report</h1>',
      '<strong>Description:</strong>',
      `<pre>${report.description}</pre>`,
      '<strong>URL:</strong> <a href="' + report.url + '">' + report.url + '</a>',
      '<strong>Environment:</strong>',
      '<ul>',
      `<li>Browser: ${report.environment.browser} ${report.environment.browserVersion}</li>`,
      `<li>OS: ${report.environment.os}</li>`,
      `<li>Screen Resolution: ${report.environment.screenResolution}</li>`,
      `<li>User Agent: ${report.environment.userAgent}</li>`,
      '</ul>',      
    ];

    if (report.customFields) {
      sections.push('<strong>Additional Information:</strong>');
      sections.push('<ul>');
      Object.entries(report.customFields).forEach(([key, value]) => {
        sections.push(`<li><strong>${key}:</strong> ${value}</li>`);
      });
      sections.push('</ul>');
    }

    return `<body>${sections.join('\n')}</body>`;
  }

  private async uploadAttachment(taskId: string, fileUrl: string): Promise<any> {
    // First, fetch the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file from URL: ${fileResponse.statusText}`);
    }

    const blob = await fileResponse.blob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const isScreenshot = blob.type.startsWith('image/');
    const extension = isScreenshot ? '.png' : '.webm';
    const filename = isScreenshot ? `screenshot_${timestamp}${extension}` : `recording_${timestamp}${extension}`;

    const formData = new FormData();
    formData.append('parent', taskId);
    formData.append('file', blob, filename);

    const response = await fetch('https://app.asana.com/api/1.0/attachments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData
    });

    if (!response.ok) {
      console.error(await response.json());
      throw new Error(`Failed to upload attachment: ${response.statusText}`);
    }

    return response.json();
  }
} 