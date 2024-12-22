import type { BugReport } from '../types';
import type { Integration, IntegrationResponse, AsanaConfig } from '../types';
export declare class AsanaIntegration implements Integration {
    private token;
    private workspace;
    private project;
    private defaultSection?;
    constructor(config: AsanaConfig);
    private createTask;
    private formatDescription;
    submit(report: BugReport): Promise<IntegrationResponse>;
}
