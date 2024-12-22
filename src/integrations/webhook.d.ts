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
export declare class WebhookIntegration implements Integration {
    private config;
    constructor(config: WebhookConfig);
    submit(report: BugReport): Promise<IntegrationResponse>;
}
