import domtoimage from 'dom-to-image-more';

export async function captureScreenshot(): Promise<string> {
  try {
    const node = document.documentElement;
    const scale = window.devicePixelRatio;
    
    // Get the computed background color from either body or html
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    // Use body background if it's not transparent, otherwise use html background, fallback to white
    const bgcolor = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : (htmlBg !== 'rgba(0, 0, 0, 0)' ? htmlBg : '#ffffff');
    
    const result = await domtoimage.toPng(node, {
      width: node.scrollWidth * scale,
      height: node.scrollHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${node.scrollWidth}px`,
        height: `${node.scrollHeight}px`,
      },
      bgcolor
    });
    
    return result;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
} 