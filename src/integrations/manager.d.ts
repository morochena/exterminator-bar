import type { BugReport } from '../types';
import type { IntegrationConfig, IntegrationResponse } from '../types';
export declare class IntegrationManager {
    private integration;
    constructor(config: IntegrationConfig);
    private createIntegration;
    submitReport(report: BugReport): Promise<IntegrationResponse>;
}
