/**
 * Webhook Integration for sending bug reports to a custom endpoint.
 * 
 * Example configuration:
 * ```typescript
 * {
 *   type: 'webhook',
 *   url: 'https://api.example.com/bugs',
 *   method: 'POST', // optional, defaults to POST
 *   headers: {
 *     'Authorization': 'Bearer your-token',
 *     'X-Custom-Header': 'custom-value'
 *   },
 *   transformPayload: (report) => ({
 *     // Transform the report into your API's expected format
 *     title: report.title,
 *     description: report.description,
 *     priority: report.severity,
 *     metadata: {
 *       browser: report.environment.browser,
 *       os: report.environment.os
 *     }
 *   })
 * }
 * ```
 */
import type { BugReport } from '../types';
import type { Integration, WebhookConfig, IntegrationResponse } from '../types';

export class WebhookIntegration implements Integration {
  constructor(private config: WebhookConfig) {
    if (!config.url) {
      throw new Error('Webhook URL is required');
    }
  }

  async submit(report: BugReport): Promise<IntegrationResponse> {
    try {
      const payload = this.config.transformPayload 
        ? this.config.transformPayload(report)
        : report;

      const response = await fetch(this.config.url, {
        method: this.config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
} 