# resize-detector

This project is basically a modified version of [Justineo/resize-detector](https://github.com/Justineo/resize-detector).

- support ie9+
- typescript

## Link

- unpkg: https://unpkg.com/resize-detector-typescript
- jsdelivr: https://cdn.jsdelivr.net/npm/resize-detector-typescript

## Usage

### Browser
```html
<script src="path/to/script"></script>

<script>
const testDom = document.createElement('div');
document.body.appendChild(testDom);

const callback = () => { console.log(testDom.offsetWidth) };

window.ResizeDetector.addResizeListener(testDom, callback);
window.ResizeDetector.removeResizeListener(testDom, callback);
</script>
```

### Import
```typescript
import {
  addResizeListener,
  removeResizeListener,
  ResizeDetectorElement,
  ResizeDetectorCallback
} from 'resize-detector-typescript';

const testDom: ResizeDetectorElement = document.createElement('div');
document.body.appendChild(testDom);

const callback: ResizeDetectorCallback = () => { console.log(testDom.offsetWidth) };

addResizeListener(testDom, callback);
removeResizeListener(testDom, callback);
```
