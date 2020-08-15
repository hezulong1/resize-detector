export interface ResizeDetectorTrigger {
  container: HTMLElement;
  expand: HTMLElement;
  expandChild: HTMLElement;
  contract: HTMLElement;
}

export interface ResizeDetectorCache {
  /**
   * 原始样式 position 值
   */
  nativePosition: string;
  width: number;
  height: number;
  timeID: number;
}

export type ResizeDetectorCallback<T extends ResizeDetectorElement> = (
  this: T,
  el: T
) => void;
export type ResizeDetectorEventListener<T extends ResizeDetectorElement> =
  | EventListenerOrEventListenerObject
  | ResizeDetectorCallback<T>
  | ResizeObserverCallback;

export interface ResizeDetectorElement extends HTMLElement {
  __mo__: MutationObserver;
  __ro__: ResizeObserver;
  __resizeListeners__: ResizeDetectorCallback<this>[];

  __resizeRendered__: boolean;
  __resizeDetached__: boolean;
  __resizeTriggered__: boolean;

  __timeID__: number;
  __position__: string;

  __resizeCache__: ResizeDetectorCache;
  __resizeTriggerNodes__: ResizeDetectorTrigger;

  __resizeMutationHandler__:
    | EventListenerOrEventListenerObject
    | MutationCallback;
  __resizeLegacyHandler__: EventListenerOrEventListenerObject;

  // IE8
  attachEvent(type: string, listener: ResizeDetectorEventListener<this>): void;
  detachEvent(type: string, listener: ResizeDetectorEventListener<this>): void;
}
