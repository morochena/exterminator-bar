import html2canvas from 'html2canvas';

export async function captureScreenshot(): Promise<string> {
  try {
    const canvas = await html2canvas(document.body, {
      logging: false,
      useCORS: true,
      scale: window.devicePixelRatio
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
} 