import { ResizeSize } from './resize-detector-state';

export type ResizeEventType = 'mutation' | 'scroll' | 'legacy';

export interface ResizeDetectorTrigger {
  container: HTMLElement;
  expand: HTMLElement;
  expandChild: HTMLElement;
  contract: HTMLElement;
}

export type ResizeDetectorCallback = () => void;
export type ResizeDetectorEventListener<T> = {
  ResizeObserver: ResizeObserverCallback;
  MutationObserver: MutationCallback;
  ResizeDetectorElement: ResizeDetectorCallback;
  Event: EventListenerOrEventListenerObject;
}[T extends ResizeObserver
  ? 'ResizeObserver'
  : T extends MutationObserver
  ? 'MutationObserver'
  : T extends ResizeDetectorElement
  ? 'ResizeDetectorElement'
  : 'Event'];

export interface ResizeDetectorElement extends HTMLElement {
  __mo__: MutationObserver;
  __ro__: ResizeObserver;
  __resizeListeners__: ResizeDetectorCallback[];

  __resizeRendered__: boolean;
  __resizeDetached__: boolean;
  __resizeTriggered__: boolean;

  __nativePosition__: string | null;
  __timeID__: number | null;

  __resizeSize__: ResizeSize;
  __resizeTriggerNodes__: ResizeDetectorTrigger;

  __resizeEvents__: {
    [K in ResizeEventType]: ResizeDetectorEventListener<
      K extends Extract<ResizeEventType, 'mutation'>
        ? string | MutationObserver
        : string
    >;
  };

  // IE8
  attachEvent(type: string, listener: ResizeDetectorEventListener<Event>): void;
  detachEvent(type: string, listener: ResizeDetectorEventListener<Event>): void;
}
