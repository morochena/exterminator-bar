import type { VisualFeedback } from '../types';

export interface ElementInfo {
  selector: string;
  xpath: string;
  elementInfo: {
    tagName: string;
    className?: string;
    id?: string;
    textContent?: string;
  };
  computedStyles: {
    size: { width: number; height: number };
    position: { x: number; y: number };
    styles: Record<string, string>;
  };
}

export class ElementPicker {
  private isActive = false;
  private hoveredElement: HTMLElement | null = null;
  private selectedElements: Set<HTMLElement> = new Set();
  private originalOutlines: Map<HTMLElement, string> = new Map();
  private pathOverlay: HTMLElement | null = null;
  private inspector: HTMLElement | null = null;
  private onSelect?: (elements: ElementInfo[]) => void;
  private isMultiSelect = false;

  constructor(onSelect?: (elements: ElementInfo[]) => void) {
    this.onSelect = onSelect;
    this.setupKeyboardShortcuts();
  }

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    
    document.addEventListener('mouseover', this.handleMouseOver);
    document.addEventListener('mouseout', this.handleMouseOut);
    document.addEventListener('click', this.handleClick);
    document.body.style.cursor = 'crosshair';

    // Create inspector overlay
    this.createInspector();
  }

  stop(): void {
    this.isActive = false;
    this.resetHighlight();
    this.selectedElements.clear();
    
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('mouseout', this.handleMouseOut);
    document.removeEventListener('click', this.handleClick);
    document.body.style.cursor = '';

    this.hidePathVisualization();
    this.hideInspector();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;

      if (e.key === 'Shift') {
        this.isMultiSelect = true;
      }
      
      if (e.key === 'Escape') {
        this.stop();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isMultiSelect = false;
      }
    });
  }

  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isActive) return;
    
    const target = event.target as HTMLElement;
    if (target === this.hoveredElement) return;

    // Smart element selection - prefer container elements
    const smartTarget = this.findBestTarget(target);
    
    this.resetHighlight();
    this.hoveredElement = smartTarget;
    this.highlightElement(smartTarget);
    this.showPathVisualization(smartTarget);
    this.updateInspector(smartTarget, event);
  };

  private handleMouseOut = (event: MouseEvent): void => {
    if (!this.isActive) return;
    this.resetHighlight();
    this.hidePathVisualization();
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.isActive || !this.hoveredElement) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = this.hoveredElement;

    if (this.isMultiSelect) {
      this.toggleElementSelection(element);
    } else {
      this.selectedElements.clear();
      this.selectedElements.add(element);
      this.submitSelection();
    }
  };

  private toggleElementSelection(element: HTMLElement): void {
    if (this.selectedElements.has(element)) {
      this.selectedElements.delete(element);
      this.resetHighlight();
    } else {
      this.selectedElements.add(element);
      this.highlightElement(element, true);
    }
  }

  private submitSelection(): void {
    const elements = Array.from(this.selectedElements).map(element => ({
      selector: this.generateSelector(element),
      xpath: this.getXPath(element),
      elementInfo: {
        tagName: element.tagName.toLowerCase(),
        className: element.className,
        id: element.id,
        textContent: element.textContent?.trim()
      },
      computedStyles: this.getComputedInfo(element)
    }));

    this.onSelect?.(elements);
    this.stop();
  }

  private findBestTarget(element: HTMLElement): HTMLElement {
    // Prefer elements that:
    // 1. Are containers with multiple children
    // 2. Have ID or meaningful classes
    // 3. Have meaningful size
    let current = element;
    let best = element;
    let bestScore = this.calculateElementScore(element);

    while (current && current !== document.body) {
      const score = this.calculateElementScore(current);
      if (score > bestScore) {
        best = current;
        bestScore = score;
      }
      current = current.parentElement!;
    }

    return best;
  }

  private calculateElementScore(element: HTMLElement): number {
    let score = 0;
    
    // Has ID
    if (element.id) score += 10;
    
    // Has classes
    score += element.classList.length * 2;
    
    // Is a container
    if (element.children.length > 0) {
      score += Math.min(element.children.length * 2, 10);
    }
    
    // Has meaningful size
    const rect = element.getBoundingClientRect();
    if (rect.width > 50 && rect.height > 50) {
      score += 5;
    }
    
    // Has meaningful content
    if (element.textContent?.trim()) {
      score += 3;
    }

    return score;
  }

  private highlightElement(element: HTMLElement, isSelected = false): void {
    this.originalOutlines.set(element, element.style.outline);
    const color = isSelected ? '#4CAF50' : '#2196F3';
    element.style.outline = `2px solid ${color}`;
    element.style.outlineOffset = '1px';
  }

  private resetHighlight(): void {
    if (this.hoveredElement && !this.selectedElements.has(this.hoveredElement)) {
      const originalOutline = this.originalOutlines.get(this.hoveredElement);
      this.hoveredElement.style.outline = originalOutline || '';
      this.originalOutlines.delete(this.hoveredElement);
      this.hoveredElement = null;
    }
  }

  private createInspector(): void {
    this.inspector = document.createElement('div');
    this.inspector.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 10000;
      font-family: monospace;
      max-width: 300px;
      display: none;
    `;
    document.body.appendChild(this.inspector);
  }

  private updateInspector(element: HTMLElement, event: MouseEvent): void {
    if (!this.inspector) return;

    const info = this.getComputedInfo(element);
    const selector = this.generateSelector(element);

    this.inspector.innerHTML = `
      <div style="margin-bottom: 4px;">
        <strong>Element:</strong> ${selector}
      </div>
      <div style="margin-bottom: 4px;">
        <strong>Size:</strong> ${info.size.width}px × ${info.size.height}px
      </div>
      <div>
        <strong>Position:</strong> ${Math.round(info.position.x)}, ${Math.round(info.position.y)}
      </div>
    `;

    // Position the inspector near the mouse but keep it in viewport
    const inspectorRect = this.inspector.getBoundingClientRect();
    let left = event.clientX + 15;
    let top = event.clientY + 15;

    if (left + inspectorRect.width > window.innerWidth) {
      left = event.clientX - inspectorRect.width - 15;
    }
    if (top + inspectorRect.height > window.innerHeight) {
      top = event.clientY - inspectorRect.height - 15;
    }

    this.inspector.style.left = `${left}px`;
    this.inspector.style.top = `${top}px`;
    this.inspector.style.display = 'block';
  }

  private hideInspector(): void {
    if (this.inspector) {
      this.inspector.remove();
      this.inspector = null;
    }
  }

  private showPathVisualization(element: HTMLElement): void {
    this.hidePathVisualization();

    this.pathOverlay = document.createElement('div');
    this.pathOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 9999;
    `;

    let current = element;
    while (current && current !== document.body) {
      const rect = current.getBoundingClientRect();
      const highlight = document.createElement('div');
      
      highlight.style.cssText = `
        position: absolute;
        border: 1px solid rgba(33, 150, 243, ${0.2 + 0.1 * this.getElementDepth(current)});
        border-radius: 2px;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        pointer-events: none;
      `;
      
      this.pathOverlay.appendChild(highlight);
      current = current.parentElement!;
    }

    document.body.appendChild(this.pathOverlay);
  }

  private hidePathVisualization(): void {
    if (this.pathOverlay) {
      this.pathOverlay.remove();
      this.pathOverlay = null;
    }
  }

  private getElementDepth(element: HTMLElement): number {
    let depth = 0;
    let current = element;
    while (current && current !== document.body) {
      depth++;
      current = current.parentElement!;
    }
    return depth;
  }

  private getComputedInfo(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    
    return {
      size: {
        width: rect.width,
        height: rect.height
      },
      position: {
        x: rect.left,
        y: rect.top
      },
      styles: {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontSize: computed.fontSize,
        display: computed.display,
        position: computed.position,
        zIndex: computed.zIndex
      }
    };
  }

  private generateSelector(element: HTMLElement): string {
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList).map(c => `.${c}`).join('');
    return `${element.tagName.toLowerCase()}${id}${classes}`;
  }

  private getXPath(element: HTMLElement): string {
    const paths: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling: Element | null = current;
      
      while (sibling) {
        if (sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const pathIndex = index ? `[${index}]` : '';
      paths.unshift(`${tagName}${pathIndex}`);
      
      current = current.parentElement;
    }
    
    return `/${paths.join('/')}`;
  }
} 