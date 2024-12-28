declare module 'webm-writer' {
  interface WebMWriterConfig {
    quality: number; // WebM image quality from 0.0 (worst) to 0.99999 (best), 1.00 (VP8L lossless) is not supported

    // You must supply one of:
    frameDuration: number | null; // Duration of frames in milliseconds
    frameRate: number | null; // Number of frames per second

    transparent: boolean; // True if an alpha channel should be included in the video
    alphaQuality?: numver; // Allows you to set the quality level of the alpha channel separately.
  }

  export default class WebMWriter {
    constructor(config: WebMWriterConfig): WebMWriter;

    addFrame(
      frame: HTMLCanvasElement | HTMLImageElement | OffscreenCanvas,
      duration?: number,
    ): void;

    complete(): Promise<Blob>;
  }
}
