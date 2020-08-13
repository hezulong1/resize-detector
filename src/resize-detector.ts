/**
 * https://github.com/Justineo/resize-detector
 * 
 * 使用 ts 重构, 并解决已知问题
 */

import { ResizeDetectorElement, ResizeDetectorCallback, RenderInfo } from "./resize-detector-options";

export function addResizeListener<T extends ResizeDetectorElement>(el: T, cb: ResizeDetectorCallback<T>): void {
  if (!el) return

  if (!el._handlerMutation) {
    el._handlerMutation = _handlerMutation.bind(el)
  }
}

export function getRenderInfo(el: HTMLElement): RenderInfo {
  const result: RenderInfo = {
    detached: false,
    rendered: false
  }

  if (document.documentElement.contains(el)) {
    let target = el;

    while (target !== document.documentElement) {
      if (getComputedStyle(target, null).getPropertyValue('display') === 'none') {
        result.detached = false
        result.rendered = false
        break
      }

      if (target && target.parentNode instanceof HTMLElement) {
        target = target.parentNode
      } else {
        break
      }
    }

    result

  } else {
    result.detached = true
  }

  return result
}

function _handlerMutation(this: ResizeDetectorElement) {
  // `this` denotes the scrolling element
  // const { rendered, detached } = getRenderInfo(this);
  // if (rendered !== this.__resize_rendered__) {
  //   if (!detached && this.__resize_triggers__) {
  //     resetTriggers(this);
  //     this.addEventListener('scroll', handleScroll, true);
  //   }
  //   this.__resize_rendered__ = rendered;
  //   runCallbacks(this);
  // }
}

