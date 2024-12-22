import html2canvas from 'html2canvas';
import rasterizehtml from "rasterizehtml"
import domtoimage from 'dom-to-image-more';

type ScreenshotMethod = 'rasterizehtml' | 'html2canvas' | 'browser' | 'dom-to-image';

export async function captureScreenshot(option: ScreenshotMethod): Promise<string> {
  switch (option) {
    case "rasterizehtml":
      return captureScreenshotRasterize();
    case "html2canvas":
      return captureScreenshotHTML2Canvas();
    case "browser":
      return captureScreenshotBrowser();
    case "dom-to-image":
      return captureScreenshotDomToImage();
    default:
      throw new Error(`Unsupported screenshot method: ${option}`);
  }
}

export async function captureScreenshotRasterize(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    const content = document.documentElement.outerHTML;
    
    // Set canvas size to match full document size
    const docHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
    
    canvas.width = window.innerWidth;
    canvas.height = docHeight;
    
    // Set white background
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    await rasterizehtml.drawHTML(content, canvas, {
      zoom: window.devicePixelRatio,
      width: window.innerWidth,
      height: docHeight
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture screenshot with rasterizehtml:', error);
    throw error;
  }
}

export async function captureScreenshotHTML2Canvas(): Promise<string> {
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

export async function captureScreenshotBrowser(): Promise<string> {
  try {
    // Request screen capture permission and get stream
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser'
      },
      audio: false
    }); 

    // Create video element to capture the stream
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    // Create canvas to draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current frame to canvas
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());

    // Convert to base64
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
} 

export async function captureScreenshotDomToImage(): Promise<string> {
  try {
    const node = document.documentElement;
    const scale = window.devicePixelRatio;
    
    const result = await domtoimage.toPng(node, {
      width: node.scrollWidth * scale,
      height: node.scrollHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${node.scrollWidth}px`,
        height: `${node.scrollHeight}px`,
      },
      bgcolor: '#ffffff'
    });
    
    return result;
  } catch (error) {
    console.error('Failed to capture screenshot with dom-to-image:', error);
    throw error;
  }
} 