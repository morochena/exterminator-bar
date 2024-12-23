import type { BugReport } from '../types';
import type { Integration, IntegrationConfig, IntegrationResponse } from '../types';
import { WebhookIntegration } from './webhook';
import { GithubIntegration } from './github';
import { AsanaIntegration } from './asana';
import { LinearIntegration } from './linear';

export class IntegrationManager {
  private integration: Integration;

  constructor(config: IntegrationConfig) {
    this.integration = this.createIntegration(config);
  }

  private createIntegration(config: IntegrationConfig): Integration {
    switch (config.type) {
      case 'webhook':
        return new WebhookIntegration(config);
      case 'github':
        return new GithubIntegration(config);
      case 'asana':
        return new AsanaIntegration(config);
      case 'linear':
        return new LinearIntegration(config);
      default:
        throw new Error(`Unsupported integration type: ${(config as IntegrationConfig).type}`);
    }
  }

  async submitReport(report: BugReport): Promise<IntegrationResponse> {
    try {
      return await this.integration.submit(report);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 