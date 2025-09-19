// Polyfill DOMMatrix for pdfjs-dist in Node.js environment
let DOMMatrixPolyfill: any;
try {
  DOMMatrixPolyfill = require('@napi-rs/canvas').DOMMatrix;
} catch {
  // Fallback implementation for build environments where @napi-rs/canvas might not be available
  DOMMatrixPolyfill = class MockDOMMatrix {
    constructor() {}
  };
}

if (typeof global.DOMMatrix === 'undefined') {
  // @ts-ignore
  global.DOMMatrix = DOMMatrixPolyfill;
}

// Polyfill URL.createObjectURL and URL.revokeObjectURL for pdfjs-dist
if (typeof global.URL.createObjectURL === 'undefined') {
  global.URL.createObjectURL = () => 'blob:http://localhost/fake-blob-url';
}
if (typeof global.URL.revokeObjectURL === 'undefined') {
  global.URL.revokeObjectURL = () => {
    /* no-op */
  };
}
