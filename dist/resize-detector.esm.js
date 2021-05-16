function createStyles(styleText) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(styleText));
    (document.querySelector('head') || document.body).appendChild(style);
    return style;
}
function getStyle(elem, prop) {
    let view = elem.ownerDocument.defaultView;
    if (!view) {
        view = window;
    }
    const computedStyle = (view.getComputedStyle(elem, null) || {
        display: 'none'
    });
    return computedStyle[prop];
}

class ResizeSize {
    constructor(width, height) {
        this.width = width | 0;
        this.height = height | 0;
        if (this.width < 0) {
            this.width = 0;
        }
        if (this.height < 0) {
            this.height = 0;
        }
    }
    equals(other) {
        return this.width === other.width && this.height === other.height;
    }
    createResizeSize(previous) {
        const widthChanged = previous.width !== this.width;
        const heightChanged = previous.height !== this.height;
        return {
            width: this.width,
            oldWidth: previous.width,
            widthChanged: widthChanged,
            height: this.height,
            oldHeight: previous.height,
            heightChanged: heightChanged
        };
    }
}

let raf;
function requestAnimationFrame(callback) {
    if (!raf) {
        raf = (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                return setTimeout(callback, 16.67);
            }).bind(window);
    }
    return raf(callback);
}
let caf;
function cancelAnimationFrame(id) {
    if (!caf) {
        caf = (window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function (id) {
                clearTimeout(id);
            }).bind(window);
    }
    caf(id);
}

var css_248z = ".ResizeDetector-trigger-container{visibility:hidden;opacity:0}.ResizeDetector-contract-trigger,.ResizeDetector-contract-trigger:before,.ResizeDetector-expand-trigger,.ResizeDetector-trigger-container{content:\"\";position:absolute;top:0;left:0;height:100%;width:100%;overflow:hidden}.ResizeDetector-contract-trigger,.ResizeDetector-expand-trigger{background:#eee;overflow:auto}.ResizeDetector-contract-trigger:before{width:200%;height:200%}";

let total = 0;
let style;
function addResizeListener(el, fn) {
    if (!el)
        return;
    if (!el.__resizeEvents__) {
        el.__resizeEvents__ = {
            mutation: _handleMutation.bind(el),
            scroll: _handleScroll.bind(el),
            legacy: function () {
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
                    if (currentSize.equals(new ResizeSize(el.offsetWidth, el.offsetHeight)))
                        return;
                }
                _handleResize(el);
            });
            const { detached, rendered } = getRenderInfo(el);
            el.__resizeTriggered__ = detached === false && rendered === false;
            el.__ro__ = ro;
            ro.observe(el);
        }
        else if (el.attachEvent && el.addEventListener) {
            el.attachEvent('onresize', el.__resizeEvents__.legacy);
            document.addEventListener('DOMSubtreeModified', el.__resizeEvents__.mutation);
        }
        else {
            if (!total) {
                style = createStyles(css_248z);
            }
            _handleCreateTrigger(el);
            el.__resizeRendered__ = getRenderInfo(el).rendered;
            const MutationObserver = window.MutationObserver ||
                window.WebKitMutationObserver ||
                window.MozMutationObserver;
            if (MutationObserver) {
                const mo = new MutationObserver((el.__resizeEvents__.mutation));
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
function removeResizeListener(el, fn) {
    var _a;
    const listeners = el === null || el === void 0 ? void 0 : el.__resizeListeners__;
    if (!listeners)
        return;
    fn && listeners.splice(listeners.indexOf(fn), 1);
    if (!listeners.length) {
        if (window.ResizeObserver) {
            if (!el.__ro__)
                return;
            el.__ro__.unobserve(el);
            el.__ro__.disconnect();
            el.__ro__ = null;
        }
        else if (el.detachEvent && el.removeEventListener) {
            el.__resizeEvents__ &&
                el.detachEvent('onresize', el.__resizeEvents__.legacy);
            el.__resizeEvents__ &&
                document.removeEventListener('DOMSubtreeModified', el.__resizeEvents__.mutation);
        }
        else {
            if (el.__mo__) {
                el.__mo__.disconnect();
                el.__mo__ = null;
            }
            el.__resizeEvents__ &&
                el.removeEventListener('scroll', el.__resizeEvents__.scroll);
            el.__resizeTriggerNodes__ &&
                el.removeChild(el.__resizeTriggerNodes__.container);
            el.__resizeTriggerNodes__ = null;
        }
        el.__resizeListeners__ = null;
    }
    if (!--total && style) {
        (_a = style.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(style);
    }
}
function getRenderInfo(target) {
    const htmlDomNode = document.documentElement;
    const result = {
        detached: false,
        rendered: false
    };
    if (htmlDomNode.contains(target)) {
        let currentNode = target;
        result.rendered = true;
        while (currentNode === htmlDomNode || htmlDomNode.contains(currentNode)) {
            if (getStyle(currentNode, 'display') === 'none') {
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
    const { detached, rendered } = getRenderInfo(this);
    if (this.__resizeRendered__ === rendered)
        return;
    this.__resizeRendered__ = rendered;
    if (!detached && this.__resizeTriggerNodes__) {
        _handleResetTrigger(this);
        this.__resizeEvents__ &&
            this.addEventListener('scroll', this.__resizeEvents__.scroll, true);
    }
    _handleResize(this);
}
function _handleScroll() {
    const scheduleUpdate = () => {
        const previousSize = this.__resizeSize__;
        const currentSize = new ResizeSize(this.offsetWidth, this.offsetHeight);
        const updated = previousSize
            ? currentSize.createResizeSize(previousSize)
            : { widthChanged: false, heightChanged: false };
        if (updated.widthChanged || updated.heightChanged) {
            this.__resizeSize__ = currentSize;
            _handleResize(this);
        }
    };
    _handleResetTrigger(this);
    this.__timeID__ && cancelAnimationFrame(this.__timeID__);
    this.__timeID__ = requestAnimationFrame(scheduleUpdate);
}
function _handleResize(el) {
    const listeners = el.__resizeListeners__ || [];
    if (listeners.length) {
        listeners.forEach(fn => {
            fn();
        });
    }
}
function _handleCreateTrigger(el) {
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
    el.__resizeEvents__ &&
        el.addEventListener('scroll', el.__resizeEvents__.scroll, true);
    el.__resizeSize__ = new ResizeSize(el.offsetWidth, el.offsetHeight);
}
function _handleResetTrigger(el) {
    if (!el.__resizeTriggerNodes__)
        return;
    const { expand, expandChild, contract } = el.__resizeTriggerNodes__;
    const { scrollWidth: csw, scrollHeight: csh } = contract;
    const { offsetWidth: eow, offsetHeight: eoh, scrollWidth: esw, scrollHeight: esh } = expand;
    contract.scrollLeft = csw;
    contract.scrollTop = csh;
    expandChild.style.width = eow + 1 + 'px';
    expandChild.style.height = eoh + 1 + 'px';
    expand.scrollLeft = esw;
    expand.scrollTop = esh;
}

export { addResizeListener, removeResizeListener };
