export interface ResizeDetectorElement extends HTMLElement {
  /**
   * 异变句柄
   */
  _handlerMutation?: Function
}

export type ResizeDetectorCallback<T extends ResizeDetectorElement> = (this: T, el: T) => void

export interface RenderInfo {
  detached: boolean;
  rendered: boolean;
}