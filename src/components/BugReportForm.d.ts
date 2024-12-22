import type { BugReport, VisualFeedback } from '../types';
export declare class BugReportForm {
    private container;
    private formData;
    private onSubmit?;
    constructor(screenshot: string | null, screenRecording: VisualFeedback['screenRecording'] | null, selectedElement: VisualFeedback['selectedElement'] | null, onSubmit?: (report: BugReport) => void);
    private createContainer;
    private render;
    private handleSubmit;
}
