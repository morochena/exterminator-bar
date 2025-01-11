import type { BugReport } from './core';

export type IntegrationType = 'webhook' | 'github' | 'asana' | 'linear';

export interface BaseConfig {
  type: IntegrationType;
}

export interface WebhookConfig extends BaseConfig {
  type: 'webhook';
  url: string;
  token: string;
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

export interface AsanaConfig extends BaseConfig {
  type: 'asana';
  token: string;
  workspace: string;
  project: string;
  defaultSection?: string;
}

export interface LinearConfig extends BaseConfig {
  type: 'linear';
  token: string;
  teamId: string;
  status?: string;
  template?: string;
  project?: string;
  projectMilestone?: string;
  cycle?: string | number;
  estimate?: number;
  labels?: string[];
  labelMap?: Record<BugReport['type'], string>;
  priorityMap?: Record<string, 'urgent' | 'high' | 'medium' | 'low'>;
}

export type IntegrationConfig = WebhookConfig | GithubConfig | AsanaConfig | LinearConfig;

export interface IntegrationResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

export interface Integration {
  submit(report: BugReport): Promise<IntegrationResponse>;
} 