const isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

export async function captureScreenshot(): Promise<string> {
  if (!isClient) {
    throw new Error('Screenshot capture is only available in browser environments');
  }

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
    console.error('Failed to capture screenshot:', error);
    throw error;
  }
} 