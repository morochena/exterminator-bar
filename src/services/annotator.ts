import { fabric } from 'fabric';
import type { VisualFeedback } from '../types';

class Arrow extends fabric.Line {
  protected arrowhead?: fabric.Polygon;

  constructor(points: number[], options: fabric.ILineOptions = {}) {
    super(points, {
      strokeWidth: 3,
      stroke: options.stroke || '#ff0000',
      ...options
    });

    this.createArrowhead();
  }

  private createArrowhead(): void {
    const xDiff = this.x2! - this.x1!;
    const yDiff = this.y2! - this.y1!;
    const angle = Math.atan2(yDiff, xDiff);

    const headLength = 20;
    const headAngle = Math.PI / 6;

    const points = [
      {
        x: this.x2! - headLength * Math.cos(angle - headAngle),
        y: this.y2! - headLength * Math.sin(angle - headAngle)
      },
      { x: this.x2!, y: this.y2! },
      {
        x: this.x2! - headLength * Math.cos(angle + headAngle),
        y: this.y2! - headLength * Math.sin(angle + headAngle)
      }
    ];

    const arrowhead = new fabric.Polygon(points, {
      fill: this.stroke as string,
      stroke: this.stroke as string,
      strokeWidth: 1,
      selectable: false,
      evented: false
    });

    if (this.canvas) {
      this.canvas.add(arrowhead);
      this.arrowhead = arrowhead;
    }
  }

  set stroke(value: string | undefined) {
    super.stroke = value;
    if (this.arrowhead) {
      this.arrowhead.set({
        fill: value,
        stroke: value
      });
      this.canvas?.renderAll();
    }
  }

  getArrowhead(): fabric.Polygon | undefined {
    return this.arrowhead;
  }
}

export class Annotator {
  private canvas: fabric.Canvas;
  private currentMode: 'select' | 'highlight' | 'arrow' | 'text' = 'select';
  private currentColor = '#ff0000';
  private isDrawing = false;
  private startPoint?: { x: number; y: number };
  private toolbarButtons: Map<string, HTMLButtonElement> = new Map();

  constructor(container: HTMLElement, backgroundImage: string) {
    // Create canvas element
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Initialize Fabric canvas
    this.canvas = new fabric.Canvas(canvas, {
      selection: true,
      backgroundColor: '#2c2c2c'
    });

    // Add keyboard event listener for delete
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' && this.currentMode === 'select') {
        const activeObjects = this.canvas.getActiveObjects();
        activeObjects.forEach(obj => {
          // If it's an arrow, also remove its arrowhead
          if (obj instanceof Arrow) {
            const arrowhead = obj.getArrowhead();
            if (arrowhead) {
              this.canvas.remove(arrowhead);
            }
          }
          this.canvas.remove(obj);
        });
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
      }
    });

    // Load background image
    fabric.Image.fromURL(backgroundImage, (img) => {
      // Get container dimensions
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Set canvas size to match container
      this.canvas.setWidth(containerWidth);
      this.canvas.setHeight(containerHeight);

      // Calculate scale to fit image within container
      const scale = Math.min(
        (containerWidth - 40) / img.width!,
        (containerHeight - 40) / img.height!
      );

      // Scale image
      img.scale(scale);

      // Center image
      img.left = (containerWidth - img.width! * scale) / 2;
      img.top = (containerHeight - img.height! * scale) / 2;

      // Set as background
      this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
    });

    this.setupDrawingMode();
    this.setupArrowMode();
  }

  setMode(mode: 'select' | 'highlight' | 'arrow' | 'text'): void {
    this.currentMode = mode;
    this.canvas.isDrawingMode = mode === 'highlight';
    
    // Enable selection and object interaction only in select mode
    this.canvas.selection = mode === 'select';
    this.canvas.getObjects().forEach(obj => {
      obj.selectable = mode === 'select';
      obj.evented = mode === 'select';
    });
    
    // Update cursor
    this.canvas.defaultCursor = this.getCurrentCursor();

    // Update toolbar button styles
    this.toolbarButtons.forEach((button, buttonMode) => {
      if (buttonMode === mode) {
        button.style.backgroundColor = '#e3f2fd';
        button.style.borderColor = '#2196f3';
      } else {
        button.style.backgroundColor = 'white';
        button.style.borderColor = '#ddd';
      }
    });
  }

  private getCurrentCursor(): string {
    switch (this.currentMode) {
      case 'select':
        return 'default';
      case 'highlight':
        return 'crosshair';
      case 'arrow':
        return 'crosshair';
      case 'text':
        return 'text';
      default:
        return 'default';
    }
  }

  registerToolbarButton(mode: string, button: HTMLButtonElement): void {
    this.toolbarButtons.set(mode, button);
    if (mode === this.currentMode) {
      button.style.backgroundColor = '#e3f2fd';
      button.style.borderColor = '#2196f3';
    }
  }

  setColor(color: string): void {
    this.currentColor = color;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
  }

  clear(): void {
    this.canvas.clear();
  }

  getAnnotations(): VisualFeedback['annotations'] {
    return this.canvas.getObjects().map(obj => {
      const { left = 0, top = 0, width = 0, height = 0 } = obj;
      const color = (obj.stroke || obj.fill || this.currentColor) as string;
      
      return {
        type: this.getObjectType(obj),
        coordinates: {
          x: left,
          y: top,
          width,
          height
        },
        color,
        content: 'text' in obj ? (obj.text as string) : undefined
      };
    });
  }

  getAnnotatedImage(): string {
    return this.canvas.toDataURL({
      format: 'png'
    });
  }

  private setupDrawingMode(): void {
    // Setup highlight brush
    this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    this.canvas.freeDrawingBrush.width = 5;
    this.canvas.freeDrawingBrush.color = this.currentColor;
    
    // Setup text mode
    this.canvas.on('mouse:down', (options) => {
      if (this.currentMode === 'text' && options.pointer) {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject && activeObject instanceof fabric.IText) {
          // If we clicked an existing text object, just enter editing mode
          activeObject.enterEditing();
          return;
        }

        const text = new fabric.IText('Click to edit', {
          left: options.pointer.x,
          top: options.pointer.y,
          fontSize: 20,
          fill: this.currentColor,
          selectable: true,
          evented: true
        });
        this.canvas.add(text);
        text.enterEditing();
        this.canvas.setActiveObject(text);
        
        // Switch back to select mode after placing text
        text.on('editing:exited', () => {
          this.setMode('select');
        });
      }
    });
  }

  private setupArrowMode(): void {
    this.canvas.on('mouse:down', (options) => {
      if (this.currentMode !== 'arrow' || !options.pointer) return;
      
      this.isDrawing = true;
      this.startPoint = options.pointer;
    });

    this.canvas.on('mouse:move', (options) => {
      if (!this.isDrawing || !this.startPoint || !options.pointer) return;

      // Remove previous arrow if it exists
      const objects = this.canvas.getObjects();
      const lastObject = objects[objects.length - 1];
      if (lastObject instanceof Arrow) {
        const arrowhead = lastObject.getArrowhead();
        if (arrowhead) {
          this.canvas.remove(arrowhead);
        }
        this.canvas.remove(lastObject);
      }

      // Create new arrow
      const arrow = new Arrow(
        [
          this.startPoint.x,
          this.startPoint.y,
          options.pointer.x,
          options.pointer.y
        ],
        { stroke: this.currentColor }
      );
      this.canvas.add(arrow);
      this.canvas.renderAll();
    });

    this.canvas.on('mouse:up', () => {
      this.isDrawing = false;
      this.startPoint = undefined;
    });
  }

  private getObjectType(obj: fabric.Object): VisualFeedback['annotations'][0]['type'] {
    if (obj instanceof fabric.Path) return 'highlight';
    if (obj instanceof fabric.IText) return 'text';
    if (obj instanceof Arrow) return 'arrow';
    return 'highlight'; // Default
  }

  destroy(): void {
    this.canvas.dispose();
  }
} 