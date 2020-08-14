export function createStyles(styleText: string): HTMLStyleElement {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(styleText));
  (document.querySelector('head') || document.body).appendChild(style);
  return style;
}

const toString = (input: unknown): string =>
  Object.prototype.toString.call(input).slice(8, -1);
export const isArray = (value: unknown): value is unknown[] =>
  Array.isArray ? Array.isArray(value) : toString(value) === 'Array';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NOOP = (): void => {};
