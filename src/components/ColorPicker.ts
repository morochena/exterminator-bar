import '../styles/main.css';

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
    container.className = 'absolute bg-white border border-gray-200 rounded-md p-2 shadow-lg grid grid-cols-5 gap-1 z-[10002]';
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
      swatch.className = 'w-6 h-6 border border-gray-200 rounded cursor-pointer p-0 m-0 transition-transform hover:scale-110';
      swatch.style.backgroundColor = color;

      swatch.onclick = () => {
        this.onSelect?.(color);
        this.hide();
      };

      this.container.appendChild(swatch);
    });
  }
} 