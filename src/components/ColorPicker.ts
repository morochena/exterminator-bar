export class ColorPicker {
  private container: HTMLElement;
  private colors = [
    '#ff0000', // Red
    '#ff4500', // Orange Red
    '#ffa500', // Orange
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#00ffff', // Cyan
    '#0000ff', // Blue
    '#800080', // Purple
    '#ff69b4', // Pink
    '#000000', // Black
  ];
  private onSelect?: (color: string) => void;

  constructor(onSelect?: (color: string) => void) {
    this.container = this.createContainer();
    this.onSelect = onSelect;
    this.render();
  }

  private createContainer(): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      z-index: 10002;
    `;
    return container;
  }

  show(x: number, y: number): void {
    this.container.style.left = `${x}px`;
    this.container.style.top = `${y}px`;
    document.body.appendChild(this.container);

    // Close picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!this.container.contains(event.target as Node)) {
        this.hide();
        document.removeEventListener('click', handleClickOutside);
      }
    };
    
    // Delay adding the event listener to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
  }

  hide(): void {
    this.container.remove();
  }

  private render(): void {
    this.colors.forEach(color => {
      const swatch = document.createElement('button');
      swatch.style.cssText = `
        width: 24px;
        height: 24px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: ${color};
        cursor: pointer;
        padding: 0;
        margin: 0;
        transition: transform 0.1s;
      `;

      swatch.onmouseover = () => {
        swatch.style.transform = 'scale(1.1)';
      };

      swatch.onmouseout = () => {
        swatch.style.transform = 'scale(1)';
      };

      swatch.onclick = () => {
        this.onSelect?.(color);
        this.hide();
      };

      this.container.appendChild(swatch);
    });
  }
} 