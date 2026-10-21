// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';

import { createCanvasPreviewDocument } from './index';
import { installCanvasProject, installCanvasProjectGlobals } from './install';
import { prepareCanvasProject } from './prepare';

afterEach(() => {
  window.dispatchEvent(new Event('lobe-canvas-dispose'));
  vi.restoreAllMocks();
});

it('keeps HTML and closing script tags inside the serialized bootstrap until it runs', () => {
  const html = createCanvasPreviewDocument(
    prepareCanvasProject({
      entry: 'index.html',
      files: [
        {
          path: 'index.html',
          content: '<script>document.title="safe"</script><h1>Canvas</h1>',
          contentType: 'text/html',
          encoding: 'utf8',
        },
      ],
    }),
  );
  const document = new DOMParser().parseFromString(html, 'text/html');
  expect(document.querySelectorAll('script')).toHaveLength(1);
  expect(document.querySelector('h1')).toBeNull();
  expect(() => new Function(document.querySelector('script')!.textContent!)).not.toThrow();
});

it('renders multi-file HTML with iframe-owned blobs and a complete import map', () => {
  const blobs: Blob[] = [];
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    blobs.push(blob as Blob);
    return `blob:null/${blobs.length}`;
  });
  const write = vi.spyOn(document, 'write').mockImplementation(() => {});
  vi.spyOn(document, 'open').mockImplementation(() => document);
  vi.spyOn(document, 'close').mockImplementation(() => {});
  installCanvasProject(
    prepareCanvasProject({
      entry: 'index.html',
      files: [
        {
          path: 'index.html',
          content:
            '<html><head><link rel="stylesheet" href="css/app.css"></head><body><img src="img/a.svg#icon"><script type="module" src="app.js"></script></body></html>',
          contentType: 'text/html',
          encoding: 'utf8',
        },
        {
          path: 'css/app.css',
          content: 'body{background:url(../img/a.svg)}',
          contentType: 'text/css',
          encoding: 'utf8',
        },
        { path: 'img/a.svg', content: '<svg/>', contentType: 'image/svg+xml', encoding: 'utf8' },
        {
          path: 'app.js',
          content: 'export const a=1',
          contentType: 'text/javascript',
          encoding: 'utf8',
        },
      ],
    }),
    'index.html',
    'function bridge(){}',
    'function globals(){}',
  );

  const html = String(write.mock.calls[0][0]);
  expect(blobs).toHaveLength(3);
  expect(html).toContain('type="importmap"');
  expect(html).toContain('lobe-canvas-project/app.js');
  expect(html).toContain('src="blob:null/1#icon"');
  expect(html).not.toContain('href="css/app.css"');
  expect(html).not.toContain('/canvas-preview');
});

it('resolves dynamic resource URLs and releases each project URL once on disposal', () => {
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  installCanvasProjectGlobals({ 'img/a.svg': 'blob:null/image' }, 'index.html', [
    'blob:null/image',
  ]);
  const resolve = Reflect.get(window, '__LOBE_CANVAS_URL__');
  expect(resolve('js/main.js', '../img/a.svg#icon').href).toBe('blob:null/image#icon');
  expect(() => resolve('js/main.js', 'https://example.com/a.svg')).toThrow();
  window.dispatchEvent(new Event('lobe-canvas-dispose'));
  window.dispatchEvent(new Event('lobe-canvas-dispose'));
  expect(revoke).toHaveBeenCalledExactlyOnceWith('blob:null/image');
  expect(Reflect.get(window, '__LOBE_CANVAS_URL__')).toBeUndefined();
});
