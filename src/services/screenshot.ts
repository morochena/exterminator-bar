import domtoimage from 'dom-to-image-more';

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

interface ScreenshotOptions {
  useScreenshotBrowserApi?: boolean;
}

export async function captureScreenshot(options: ScreenshotOptions = {}): Promise<string> {
  if (!isClient) {
    throw new Error('Screenshot capture is only available in browser environments');
  }

  try {
    if (options.useScreenshotBrowserApi) {
      return await captureBrowserScreenshot();
    }
    return await captureDomToImageScreenshot();
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
}

async function captureBrowserScreenshot(): Promise<string> {
  try {
    // @ts-ignore - preferCurrentTab is a newer API feature not yet in TypeScript types
    const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
    
    // Create video element to capture the frame
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    // Create canvas to draw the frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Draw the video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());
    
    // Convert to base64
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Browser API screenshot failed:', error);
    throw error;
  }
}

async function captureDomToImageScreenshot(): Promise<string> {
  const node = document.documentElement;
  const scale = window.devicePixelRatio;
  
  // Get the computed background color from either body or html
  const bodyBg = window.getComputedStyle(document.body).backgroundColor;
  const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
  // Use body background if it's not transparent, otherwise use html background, fallback to white
  const bgcolor = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : (htmlBg !== 'rgba(0, 0, 0, 0)' ? htmlBg : '#ffffff');
  
  return await domtoimage.toPng(node, {
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
} 