# resize-detector

This project is basically a modified version of [Justineo/resize-detector](https://github.com/Justineo/resize-detector).

- support ie9+
- typescript

```typescript
import { addResizeListener, removeResizeListener } from 'resize-detector-typescript';
import { ResizeDetectorElement, ResizeDetectorCallback } from 'resize-detector-typescript/dist/resize-detector-options';


const testDom: ResizeDetectorElement = document.createElement('div');
document.body.appendChild(testDom);

const callback: ResizeDetectorCallback = () => { console.log(testDom.offsetWidth) };

addResizeListener(testDom, callback);
removeResizeListener(testDom, callback);
```