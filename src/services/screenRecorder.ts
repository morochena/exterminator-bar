export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private stream: MediaStream | null = null;

  private get isClient(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'mediaDevices' in navigator;
  }

  async start(): Promise<void> {
    if (!this.isClient) {
      throw new Error('Screen recording is only available in browser environments with mediaDevices support');
    }

    try {
      // Request screen capture permission and get stream
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Create MediaRecorder instance
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start screen recording:', error);
      throw error;
    }
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.stream) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Create final video blob
        const videoBlob = new Blob(this.recordedChunks, {
          type: 'video/webm'
        });

        // Clean up
        this.recordedChunks = [];
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.mediaRecorder = null;
        this.isRecording = false;

        resolve(videoBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isActive(): boolean {
    return this.isRecording;
  }
} 