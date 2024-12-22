export declare class ColorPicker {
    private container;
    private colors;
    private onSelect?;
    constructor(onSelect?: (color: string) => void);
    private createContainer;
    show(x: number, y: number): void;
    hide(): void;
    private render;
}
