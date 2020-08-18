declare module '*.css';

interface Window {
  mozRequestAnimationFrame(callback: FrameRequestCallback): number;
  mozCancelAnimationFrame(handle: number): void;
}
