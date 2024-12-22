export declare class ScreenRecorder {
    private mediaRecorder;
    private recordedChunks;
    private isRecording;
    private stream;
    start(): Promise<void>;
    stop(): Promise<Blob>;
    isActive(): boolean;
}
