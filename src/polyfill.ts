let raf: (callback: FrameRequestCallback) => number;
export function requestAnimationFrame(callback: FrameRequestCallback): number {
  if (!raf) {
    raf = (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback) {
        return setTimeout(callback, 16.67);
      }
    ).bind(window);
  }
  return raf(callback);
}

let caf: (handle: number) => void;
export function cancelAnimationFrame(id: number): void {
  if (!caf) {
    caf = (
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      function (id) {
        clearTimeout(id);
      }
    ).bind(window);
  }
  caf(id);
}
