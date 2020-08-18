/**
 * refrence: https://github.com/Justineo/resize-detector
 */

import {
  ResizeDetectorElement,
  ResizeDetectorCallback,
  ResizeDetectorEventListener
} from './resize-detector-options';
import { createStyles, getStyle } from './util';
import { ResizeSize } from './resize-detector-state';
import { requestAnimationFrame, cancelAnimationFrame } from './polyfill';

import css from './resize-detector.css';

let total = 0;
let style: HTMLStyleElement;

export function addResizeListener(
  el: ResizeDetectorElement,
  fn: ResizeDetectorCallback
): void {
  if (!el) return;

  if (!el.__resizeEvents__) {
    el.__resizeEvents__ = {
      mutation: _handleMutation.bind(el),
      scroll: _handleScroll.bind(el),
      legacy: function (this: ResizeDetectorElement) {
        _handleResize(this);
      }.bind(el)
    };
  }

  if (!el.__resizeListeners__) {
    el.__resizeListeners__ = [];

    if (window.ResizeObserver) {
      const currentSize = new ResizeSize(el.offsetWidth, el.offsetHeight);
      const ro = new ResizeObserver(() => {
        if (!el.__resizeTriggered__) {
          el.__resizeTriggered__ = true;
          if (
            currentSize.equals(new ResizeSize(el.offsetWidth, el.offsetHeight))
          )
            return;
        }
        _handleResize(el);
      });

      // initially display none won't trigger ResizeObserver callback
      const { detached, rendered } = getRenderInfo(el);
      el.__resizeTriggered__ = detached === false && rendered === false;

      el.__ro__ = ro;
      ro.observe(el);
    } else if (el.attachEvent && el.addEventListener) {
      // targeting IE9/10
      el.attachEvent('onresize', el.__resizeEvents__.legacy);
      document.addEventListener(
        'DOMSubtreeModified',
        <ResizeDetectorEventListener<Event>>el.__resizeEvents__.mutation
      );
    } else {
      if (!total) {
        style = createStyles(css);
      }
      _handleCreateTrigger(el);

      el.__resizeRendered__ = getRenderInfo(el).rendered;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const MutationObserver =
        window.MutationObserver ||
        (window as any).WebKitMutationObserver ||
        (window as any).MozMutationObserver;

      if (MutationObserver) {
        const mo = new MutationObserver(
          <ResizeDetectorEventListener<MutationObserver>>(
            el.__resizeEvents__.mutation
          )
        );
        mo.observe(document, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });
        el.__mo__ = mo;
      }
    }
  }

  el.__resizeListeners__.push(fn);
  total++;
}

export function removeResizeListener(
  el: ResizeDetectorElement,
  fn: ResizeDetectorCallback
): void {
  const listeners = el?.__resizeListeners__;

  if (!listeners) return;
  fn && listeners.splice(listeners.indexOf(fn), 1);

  // no listeners exist, or removing all listeners
  if (!listeners.length) {
    if (window.ResizeObserver) {
      if (!el.__ro__) return;

      el.__ro__.unobserve(el);
      el.__ro__.disconnect();
      el.__ro__ = <never>null;
    } else if (el.detachEvent && el.removeEventListener) {
      el.detachEvent('onresize', el.__resizeEvents__.legacy);
      document.removeEventListener(
        'DOMSubtreeModified',
        <ResizeDetectorEventListener<Event>>el.__resizeEvents__.mutation
      );
    } else {
      if (el.__mo__) {
        el.__mo__.disconnect();
        el.__mo__ = <never>null;
      }
      el.removeEventListener('scroll', el.__resizeEvents__.scroll);
      el.__resizeTriggerNodes__ &&
        el.removeChild(el.__resizeTriggerNodes__.container);
      el.__resizeTriggerNodes__ = <never>null;
    }

    el.__resizeListeners__ = <never>null;
  }

  if (!--total && style) {
    style.parentNode?.removeChild(style);
  }
}

export interface RenderInfo {
  detached: boolean;
  rendered: boolean;
}
/**
 * 获取元素的信息，源代码个人解读完理解为：
 *
 * detached -> 是否为孤立元素
 * rendered -> 是否可渲染使用
 *
 * ```
 *
 *           { detached: true; rendered: false }
 *          /
 *         / Y
 *  被 html 元素包含             { detached: false; rendered: false }
 *         \ N                 /
 *          \                 / Y
 *      target - html 存在隐藏元素
 *                            \ N
 *                              \
 *                               { detached: false; rendered: true }
 *
 *
 * ```
 */
function getRenderInfo(target: HTMLElement): RenderInfo {
  const htmlDomNode: HTMLElement = document.documentElement;
  const result: RenderInfo = {
    detached: false,
    rendered: false
  };

  // 被 html 元素包含
  if (htmlDomNode.contains(target)) {
    let currentNode = target;
    result.rendered = true;

    // IS DISPLAY=NONE 当前以及父级中均不可隐藏
    while (currentNode === htmlDomNode || htmlDomNode.contains(currentNode)) {
      if (getStyle(currentNode, 'display') === 'none') {
        result.rendered = false;
        break;
      }

      if (currentNode.parentNode instanceof HTMLElement) {
        currentNode = currentNode.parentNode;
      } else {
        break;
      }
    }
  } else {
    result.detached = true;
  }

  return result;
}

/**
 * @private
 * @param this ResizeDetectorElement
 */
function _handleMutation(this: ResizeDetectorElement): void {
  const { detached, rendered } = getRenderInfo(this);

  if (this.__resizeRendered__ === rendered) return;
  this.__resizeRendered__ = rendered;

  if (!detached && this.__resizeTriggerNodes__) {
    _handleResetTrigger(this);
    this.addEventListener('scroll', this.__resizeEvents__.scroll, true);
  }

  _handleResize(this);
}

function _handleScroll(this: ResizeDetectorElement): void {
  const scheduleUpdate = () => {
    const previousSize = this.__resizeSize__;
    const currentSize = new ResizeSize(this.offsetWidth, this.offsetHeight);
    const updated = currentSize.createResizeSize(previousSize);

    if (updated.widthChanged || updated.heightChanged) {
      this.__resizeSize__ = currentSize;
      _handleResize(this);
    }
  };

  _handleResetTrigger(this);

  this.__timeID__ && cancelAnimationFrame(this.__timeID__);
  this.__timeID__ = requestAnimationFrame(scheduleUpdate);
}

function _handleResize(el: ResizeDetectorElement): void {
  const listeners = el.__resizeListeners__ || [];
  if (listeners.length) {
    listeners.forEach(fn => {
      fn();
    });
  }
}

function _handleCreateTrigger(el: ResizeDetectorElement): void {
  const nativePosition = getComputedStyle(el, null).position;

  if (!nativePosition || nativePosition === 'static') {
    el.style.position = 'relative';
  }

  el.__nativePosition__ = nativePosition;

  const $container = document.createElement('div');
  $container.className = 'ResizeDetector-trigger-container';

  const $trigger = document.createElement('div');
  const $triggerChild = document.createElement('div');
  $trigger.className = 'ResizeDetector-expand-trigger';

  const $contractTrigger = document.createElement('div');
  $contractTrigger.className = 'ResizeDetector-contract-trigger';

  $trigger.appendChild($triggerChild);
  $container.appendChild($trigger);
  $container.appendChild($contractTrigger);
  el.appendChild($container);

  el.__resizeTriggerNodes__ = {
    container: $container,
    expand: $trigger,
    expandChild: $triggerChild,
    contract: $contractTrigger
  };

  _handleResetTrigger(el);

  el.addEventListener('scroll', el.__resizeEvents__.scroll, true);
  el.__resizeSize__ = new ResizeSize(el.offsetWidth, el.offsetHeight);
}

function _handleResetTrigger(el: ResizeDetectorElement) {
  if (!el.__resizeTriggerNodes__) return;

  const { expand, expandChild, contract } = el.__resizeTriggerNodes__;

  // batch read
  const { scrollWidth: csw, scrollHeight: csh } = contract;
  const {
    offsetWidth: eow,
    offsetHeight: eoh,
    scrollWidth: esw,
    scrollHeight: esh
  } = expand;

  // batch write
  contract.scrollLeft = csw;
  contract.scrollTop = csh;
  expandChild.style.width = eow + 1 + 'px';
  expandChild.style.height = eoh + 1 + 'px';
  expand.scrollLeft = esw;
  expand.scrollTop = esh;
}
