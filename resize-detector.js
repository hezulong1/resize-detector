(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ResizeDetector = {}));
}(this, (function (exports) { 'use strict';

  function createStyles(styleText) {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(styleText));
      (document.querySelector('head') || document.body).appendChild(style);
      return style;
  }
  var toString = function (input) {
      return Object.prototype.toString.call(input).slice(8, -1);
  };
  var isArray = function (value) {
      return Array.isArray ? Array.isArray(value) : toString(value) === 'Array';
  };
  var NOOP = function () { };

  var ResizeSize = (function () {
      function ResizeSize(width, height) {
          this.width = width | 0;
          this.height = height | 0;
          if (this.width < 0) {
              this.width = 0;
          }
          if (this.height < 0) {
              this.height = 0;
          }
      }
      ResizeSize.prototype.equals = function (other) {
          return this.width === other.width && this.height === other.height;
      };
      ResizeSize.prototype.createResizeSize = function (previous) {
          var widthChange = previous.width !== this.width;
          var heightChanged = previous.height !== this.height;
          return {
              width: this.width,
              oldWidth: previous.width,
              widthChanged: widthChange,
              height: this.height,
              oldHeight: previous.height,
              heightChanged: heightChanged
          };
      };
      return ResizeSize;
  }());

  var total = 0;
  var style;
  var css = ".ResizeDetector-trigger-container {\n  visibility: hidden;\n  opacity: 0;\n}\n\n.ResizeDetector-trigger-container,\n.ResizeDetector-expand-trigger,\n.ResizeDetector-contract-trigger,\n.ResizeDetector-contract-trigger:before {\n  content: \"\";\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n}\n\n.ResizeDetector-expand-trigger,\n.ResizeDetector-contract-trigger {\n  background: #eee;\n  overflow: auto;\n}\n\n.ResizeDetector-contract-trigger:before {\n  width: 200%;\n  height: 200%;\n}";
  var spawnResizeListener = function (el) {
      var _add = NOOP;
      var _remove = NOOP;
      if (window.ResizeObserver) {
          _add = function () {
              var currentSize = new ResizeSize(el.offsetWidth, el.offsetHeight);
              var ro = new ResizeObserver(function () {
                  if (!el.__resizeTriggered__) {
                      el.__resizeTriggered__ = true;
                      if (currentSize.equals(new ResizeSize(el.offsetWidth, el.offsetHeight)))
                          return;
                  }
                  _handleRunCallback(el);
              });
              var _a = getRenderInfo(el), detached = _a.detached, rendered = _a.rendered;
              el.__resizeTriggered__ = detached === false && rendered === false;
              el.__ro__ = ro;
              ro.observe(el);
          };
          _remove = function () {
              if (el.__ro__) {
                  el.__ro__.unobserve(el);
                  el.__ro__.disconnect();
                  el.__ro__ = null;
              }
          };
      }
      else if (el.attachEvent && el.addEventListener) {
          _add = function () {
              el.__resizeLegacyHandler__ = function handleLegacyResize() {
                  _handleRunCallback(el);
              };
              el.attachEvent('onresize', el.__resizeLegacyHandler__);
              document.addEventListener('DOMSubtreeModified', el.__resizeMutationHandler__);
          };
          _remove = function () {
              el.detachEvent('onresize', el.__resizeLegacyHandler__);
              document.removeEventListener('DOMSubtreeModified', el.__resizeMutationHandler__);
          };
      }
      else if (window.MutationObserver) {
          _add = function () {
              if (!total) {
                  style = createStyles(css);
              }
              _handleCreateTrigger(el);
              el.__resizeRendered__ = getRenderInfo(el).rendered;
              var mo = new MutationObserver(el.__resizeMutationHandler__);
              mo.observe(document, {
                  attributes: true,
                  childList: true,
                  characterData: true,
                  subtree: true
              });
              el.__mo__ = mo;
          };
          _remove = function () {
              if (el.__mo__) {
                  el.__mo__.disconnect();
                  el.__mo__ = null;
              }
              el.removeEventListener('scroll', _handleScroll);
              el.__resizeTriggerNodes__ &&
                  el.removeChild(el.__resizeTriggerNodes__.container);
              el.__resizeTriggerNodes__ = null;
          };
      }
      return { add: _add, remove: _remove };
  };
  function addResizeListener(el, fn) {
      if (!el)
          return;
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
  function removeResizeListener(el, fn) {
      var _a;
      var listeners = el === null || el === void 0 ? void 0 : el.__resizeListeners__;
      if (!listeners)
          return;
      fn && listeners.splice(listeners.indexOf(fn), 1);
      if ((isArray(listeners) && !listeners.length) || !fn) {
          spawnResizeListener(el).remove();
          el.__resizeListeners__ = null;
      }
      if (!--total && style) {
          (_a = style.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(style);
      }
  }
  function getRenderInfo(target) {
      var htmlDomNode = document.documentElement;
      var result = {
          detached: false,
          rendered: false
      };
      if (htmlDomNode.contains(target)) {
          var currentNode = target;
          result.rendered = true;
          while (currentNode === htmlDomNode || htmlDomNode.contains(currentNode)) {
              if (getComputedStyle(currentNode, null).getPropertyValue('display') ===
                  'none') {
                  result.rendered = false;
                  break;
              }
              if (currentNode.parentNode instanceof HTMLElement) {
                  currentNode = currentNode.parentNode;
              }
              else {
                  break;
              }
          }
      }
      else {
          result.detached = true;
      }
      return result;
  }
  function _handleMutation() {
      var _a = getRenderInfo(this), detached = _a.detached, rendered = _a.rendered;
      if (this.__resizeRendered__ === rendered)
          return;
      this.__resizeRendered__ = rendered;
      if (detached)
          return;
      if (!detached && this.__resizeTriggerNodes__) {
          _handleResetTrigger(this);
          this.addEventListener('scroll', _handleScroll, true);
      }
      _handleRunCallback(this);
  }
  function _handleScroll() {
      var _this = this;
      var scheduleUpdate = function () {
          var updated = getUpdatedSize(_this);
          if (updated) {
              _this.__resizeCache__.width = updated.width;
              _this.__resizeCache__.height = updated.height;
              _handleRunCallback(_this);
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
  function _handleRunCallback(elem) {
      if (!elem || !elem.__resizeListeners__) {
          return;
      }
      elem.__resizeListeners__.forEach(function (callback) {
          return callback.call(elem, elem);
      });
  }
  function _handleCreateTrigger(el) {
      var nativePosition = getComputedStyle(el, null).position;
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
      var $container = document.createElement('div');
      $container.className = 'ResizeDetector-trigger-container';
      var $trigger = document.createElement('div');
      var $triggerChild = document.createElement('div');
      $trigger.className = 'ResizeDetector-expand-trigger';
      var $contractTrigger = document.createElement('div');
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
  function _handleResetTrigger(el) {
      if (!el.__resizeTriggerNodes__)
          return;
      var _a = el.__resizeTriggerNodes__, expand = _a.expand, expandChild = _a.expandChild, contract = _a.contract;
      var csw = contract.scrollWidth, csh = contract.scrollHeight;
      var eow = expand.offsetWidth, eoh = expand.offsetHeight, esw = expand.scrollWidth, esh = expand.scrollHeight;
      contract.scrollLeft = csw;
      contract.scrollTop = csh;
      expandChild.style.width = eow + 1 + 'px';
      expandChild.style.height = eoh + 1 + 'px';
      expand.scrollLeft = esw;
      expand.scrollTop = esh;
  }
  function getUpdatedSize(el) {
      if (!el.__resizeCache__)
          return;
      var _a = el.__resizeCache__, width = _a.width, height = _a.height;
      var offsetWidth = el.offsetWidth, offsetHeight = el.offsetHeight;
      if (offsetWidth !== width || offsetHeight !== height) {
          return {
              width: offsetWidth,
              height: offsetHeight
          };
      }
  }

  exports.addResizeListener = addResizeListener;
  exports.getRenderInfo = getRenderInfo;
  exports.removeResizeListener = removeResizeListener;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
