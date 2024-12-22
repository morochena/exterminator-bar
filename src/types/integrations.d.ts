import type { BugReport } from './core';
export type IntegrationType = 'webhook' | 'github' | 'asana';
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
export interface AsanaConfig extends BaseConfig {
    type: 'asana';
    token: string;
    workspace: string;
    project: string;
    defaultSection?: string;
}
export type IntegrationConfig = WebhookConfig | GithubConfig | AsanaConfig;
export interface IntegrationResponse {
    success: boolean;
    error?: string;
    data?: unknown;
}
export interface Integration {
    submit(report: BugReport): Promise<IntegrationResponse>;
}
