/**
 * 参考 https://github.com/Justineo/resize-detector
 *
 * 使用 ts 重构
 *
 * 1) 移除不合理的逻辑
 * 2) 优化代码
 * 3) 补足声明文件缺少
 */

import {
  ResizeDetectorElement,
  ResizeDetectorCallback
} from './resize-detector-options';
import { isArray, NOOP, createStyles } from './util';
import { ResizeSize } from './resize-detector-state';

let total = 0;
let style: HTMLStyleElement;

const css: string = require('./resize-detector.css');

const spawnResizeListener = function (el: ResizeDetectorElement) {
  let resizeListener: () => void = NOOP;
  let disconnectResizeListener: () => void = NOOP;

  if (window.ResizeObserver) {
    resizeListener = function () {
      const currentSize = new ResizeSize(el.offsetWidth, el.offsetHeight);
      const ro = new ResizeObserver(() => {
        if (!el.__resizeTriggered__) {
          el.__resizeTriggered__ = true;
          if (
            currentSize.equals(new ResizeSize(el.offsetWidth, el.offsetHeight))
          )
            return;
        }
        _handleRunCallback(el);
      });

      // initially display none won't trigger ResizeObserver callback
      const { detached, rendered } = getRenderInfo(el);
      el.__resizeTriggered__ = detached === false && rendered === false;

      el.__ro__ = ro;
      ro.observe(el);
    };
    disconnectResizeListener = function () {
      if (el.__ro__) {
        el.__ro__.unobserve(el);
        el.__ro__.disconnect();
        el.__ro__ = <never>null;
      }
    };
  } else if (el.attachEvent && el.addEventListener) {
    resizeListener = function () {
      // targeting IE9/10
      el.__resizeLegacyHandler__ = function handleLegacyResize() {
        _handleRunCallback(el);
      };
      el.attachEvent('onresize', el.__resizeLegacyHandler__);
      document.addEventListener(
        'DOMSubtreeModified',
        <EventListenerOrEventListenerObject>el.__resizeMutationHandler__
      );
    };
    disconnectResizeListener = function () {
      el.detachEvent('onresize', el.__resizeLegacyHandler__);
      document.removeEventListener(
        'DOMSubtreeModified',
        <EventListenerOrEventListenerObject>el.__resizeMutationHandler__
      );
    };
  } else if (window.MutationObserver) {
    resizeListener = function () {
      if (!total) {
        style = createStyles(css);
      }
      _handleCreateTrigger(el);

      el.__resizeRendered__ = getRenderInfo(el).rendered;

      const mo = new MutationObserver(
        <MutationCallback>el.__resizeMutationHandler__
      );
      mo.observe(document, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
      });
      el.__mo__ = mo;
    };
    disconnectResizeListener = function () {
      if (el.__mo__) {
        el.__mo__.disconnect();
        el.__mo__ = <never>null;
      }
      el.removeEventListener('scroll', _handleScroll);
      el.__resizeTriggerNodes__ &&
        el.removeChild(el.__resizeTriggerNodes__.container);
      el.__resizeTriggerNodes__ = <never>null;
    };
  }

  return { add: resizeListener, remove: disconnectResizeListener };
};

export function addResizeListener<T extends ResizeDetectorElement>(
  el: T,
  fn: ResizeDetectorCallback<T>
): void {
  if (!el) return;

  if (!el.__resizeMutationHandler__) {
    el.__resizeMutationHandler__ = _handleMutation.bind(el);
  }

  if (!el.__resizeListeners__) {
    el.__resizeListeners__ = [];
    spawnResizeListener(el).add();
  }

  el.__resizeListeners__.push(fn);
  total++;
}

export function removeResizeListener<T extends ResizeDetectorElement>(
  el: T,
  fn: ResizeDetectorCallback<T>
): void {
  const listeners = el?.__resizeListeners__;

  if (!listeners) return;
  fn && listeners.splice(listeners.indexOf(fn), 1);

  // no listeners exist, or removing all listeners
  if ((isArray(listeners) && !listeners.length) || !fn) {
    spawnResizeListener(el).remove();

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
 * detached -> isDetached // 是否为孤立元素
 * rendered -> canRender  // 是否可渲染使用
 *
 * ```
 *
 *           { isDetached: true; canRender: false }
 *          /
 *         / Y
 *  被 html 元素包含             { isDetached: false; canRender: false }
 *         \ N                 /
 *          \                 / Y
 *      target - html 存在隐藏元素
 *                            \ N
 *                              \
 *                               { isDetached: false; canRender: true }
 *
 *
 * ```
 * @public
 * @param target 被检测的 HTMLElement 元素
 */
export function getRenderInfo(target: HTMLElement): RenderInfo {
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
      if (
        getComputedStyle(currentNode, null).getPropertyValue('display') ===
        'none'
      ) {
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

  if (detached) return;

  if (!detached && this.__resizeTriggerNodes__) {
    _handleResetTrigger(this);
    this.addEventListener('scroll', _handleScroll, true);
  }

  _handleRunCallback(this);
}

/**
 * @private
 * @param this
 */
function _handleScroll(this: ResizeDetectorElement): void {
  const scheduleUpdate = () => {
    const updated = getUpdatedSize(this);

    if (updated) {
      this.__resizeCache__.width = updated.width;
      this.__resizeCache__.height = updated.height;
      _handleRunCallback(this);
    }
  };

  _handleResetTrigger(this);

  if (!this.__resizeCache__) {
    this.__resizeCache__ = {
      nativePosition: '',
      timeID: -1,
      width: 0,
      height: 0
    };
  }

  cancelAnimationFrame(this.__resizeCache__.timeID);
  this.__resizeCache__.timeID = requestAnimationFrame(scheduleUpdate);
}

/**
 * @private
 * @param elem
 */
function _handleRunCallback(elem: ResizeDetectorElement) {
  if (!elem || !elem.__resizeListeners__) {
    return;
  }
  elem.__resizeListeners__.forEach(callback => {
    return callback.call(elem, elem);
  });
}

/**
 * 初始化触发器
 * @private
 * @param el ResizeDetectorElement
 */
function _handleCreateTrigger(el: ResizeDetectorElement): void {
  const nativePosition = getComputedStyle(el, null).position;

  if (!nativePosition || nativePosition === 'static') {
    el.style.position = 'relative';
  }

  if (!el.__resizeCache__) {
    el.__resizeCache__ = {
      nativePosition: nativePosition,
      width: 0,
      height: 0,
      timeID: -1
    };
  }

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

  el.addEventListener('scroll', _handleScroll, true);

  if (el.__resizeCache__) {
    el.__resizeCache__.width = el.offsetWidth;
    el.__resizeCache__.height = el.offsetHeight;
  }
}
/**
 * 重置触发器
 * @private
 * @param el ResizeDetectorElement
 */
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

/**
 * @private
 * @param el
 */
function getUpdatedSize(el: ResizeDetectorElement) {
  if (!el.__resizeCache__) return;

  const { width, height } = el.__resizeCache__;
  const { offsetWidth, offsetHeight } = el;

  if (offsetWidth !== width || offsetHeight !== height) {
    return {
      width: offsetWidth,
      height: offsetHeight
    };
  }
}
