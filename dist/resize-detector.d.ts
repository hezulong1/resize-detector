import {
  ResizeDetectorElement,
  ResizeDetectorCallback
} from './resize-detector-options';
export declare function addResizeListener(
  el: ResizeDetectorElement,
  fn: ResizeDetectorCallback
): void;
export declare function removeResizeListener(
  el: ResizeDetectorElement,
  fn: ResizeDetectorCallback
): void;
export interface RenderInfo {
  detached: boolean;
  rendered: boolean;
}
