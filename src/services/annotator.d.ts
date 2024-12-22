import type { VisualFeedback } from '../types';
export declare class Annotator {
    private canvas;
    private currentMode;
    private currentColor;
    private isDrawing;
    private startPoint?;
    private toolbarButtons;
    constructor(container: HTMLElement, backgroundImage: string);
    setMode(mode: 'select' | 'highlight' | 'arrow' | 'text'): void;
    private getCurrentCursor;
    registerToolbarButton(mode: string, button: HTMLButtonElement): void;
    setColor(color: string): void;
    clear(): void;
    getAnnotations(): VisualFeedback['annotations'];
    getAnnotatedImage(): string;
    private setupDrawingMode;
    private setupArrowMode;
    private getObjectType;
    destroy(): void;
}
