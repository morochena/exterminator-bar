/**
 * Integration Types and Configurations
 * 
 * Example usage in widget initialization:
 * ```typescript
 * initBugTool({
 *   // ... other config options ...
 *   integration: {
 *     // Choose one of the following integration configs:
 *     
 *     // 1. Webhook Integration
 *     type: 'webhook',
 *     url: 'https://api.example.com/bugs',
 *     method: 'POST',
 *     headers: {
 *       'Authorization': 'Bearer token'
 *     }
 *     
 *     // 2. GitHub Integration
 *     type: 'github',
 *     owner: 'username',
 *     repo: 'repo-name',
 *     token: 'github-token',
 *     labels: ['bug']
 *   }
 * });
 * ```
 */
import type { BugReport } from '../types';

export type IntegrationType = 'webhook' | 'github';

export interface BaseConfig {
  type: IntegrationType;
}

export interface WebhookConfig extends BaseConfig {
  type: 'webhook';
  url: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  transformPayload?: (report: BugReport) => unknown;
}

export interface GithubConfig extends BaseConfig {
  type: 'github';
  owner: string;
  repo: string;
  token: string;
  labels?: string[];
}

export type IntegrationConfig = WebhookConfig | GithubConfig;

export interface IntegrationResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface Integration {
  submit(report: BugReport): Promise<IntegrationResponse>;
} 