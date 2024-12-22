import type { BugReport } from './core';

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