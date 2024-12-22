import type { BugReport, IntegrationConfig } from './types';
export interface WidgetConfig {
    integration?: IntegrationConfig;
    callbacks?: {
        onSubmit?: (report: BugReport) => Promise<void>;
        onError?: (error: Error) => void;
    };
}
export declare class BugToolbar {
    private config?;
    private toolbar;
    private annotator;
    private colorPicker;
    private screenshot;
    private screenRecorder;
    private screenRecordingData;
    private integrationManager?;
    private recordButton;
    constructor(config?: WidgetConfig | undefined);
    private createToolbar;
    private createToolbarButton;
    private handleScreenshot;
    private handleScreenRecording;
    private handleSubmit;
    private handleBugReport;
    private handleAnnotationTool;
    private handleColorSelect;
    private handleAnnotationDone;
    private showAnnotator;
    private createAnnotationButton;
}
export declare function init(config?: WidgetConfig): void;
