export interface ResizeDetectorElementSize {
  width: number;
  height: number;
}
export interface ResizeDetectorElementState {
  width: number;
  oldWidth: number;
  widthChanged: boolean;
  height: number;
  oldHeight: number;
  heightChanged: boolean;
}
export declare class ResizeSize implements ResizeDetectorElementSize {
  readonly width: number;
  readonly height: number;
  constructor(width: number, height: number);
  equals(other: ResizeSize): boolean;
  createResizeSize(previous: ResizeSize): ResizeDetectorElementState;
}
