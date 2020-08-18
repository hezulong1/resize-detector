export function createStyles(styleText: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(styleText));
  (document.querySelector('head') || document.body).appendChild(style);
  return style;
}

export function getStyle(elem: HTMLElement, prop: string): string {
  // code from jQuery
  //
  // Support: IE <=11+ (trac-14150)
  // In IE popup's `window` is the opener window which makes `window.getComputedStyle( elem )`
  // break. Using `elem.ownerDocument.defaultView` avoids the issue.
  let view = elem.ownerDocument.defaultView;

  // `document.implementation.createHTMLDocument( "" )` has a `null` `defaultView`
  // property; check `defaultView` truthiness to fallback to window in such a case.
  if (!view) {
    view = window;
  }
  // for older versions of Firefox, `getComputedStyle` required
  // the second argument and may return `null` for some elements
  // when `display: none`
  const computedStyle = (((view.getComputedStyle(
    elem,
    null
  ) as unknown) as Record<PropertyKey, string>) || {
    display: 'none'
  }) as Record<string, string>;

  return computedStyle[prop];
}
