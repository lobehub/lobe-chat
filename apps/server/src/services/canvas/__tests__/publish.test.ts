// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { buildCanvasPublishBundle, resolveCanvasPublicRuntimeUrl } from '../publish';
import type { CanvasStorageService } from '../storage';

const manifest = {
  entry: 'index.html',
  files: {
    'about/index.html': { contentType: 'text/html; charset=utf-8', hash: 'h3', size: 20 },
    'index.html': { contentType: 'text/html; charset=utf-8', hash: 'h1', size: 40 },
    'logo.png': { contentType: 'image/png', hash: 'h4', size: 3 },
    'styles.css': { contentType: 'text/css; charset=utf-8', hash: 'h2', size: 10 },
  },
  runtimeMajor: 1,
  schemaVersion: 1 as const,
};

const contents: Record<string, Uint8Array> = {
  'about/index.html': new TextEncoder().encode('<p>about</p>'),
  'index.html': new TextEncoder().encode('<html><head></head><body>hi</body></html>'),
  'logo.png': new Uint8Array([1, 2, 3]),
  'styles.css': new TextEncoder().encode('body{}'),
};

const storage = {
  readFile: vi.fn(async (_manifest: unknown, path: string) => ({
    bytes: contents[path],
    contentType: manifest.files[path as keyof typeof manifest.files].contentType,
  })),
} as unknown as CanvasStorageService;

describe('buildCanvasPublishBundle', () => {
  it('injects the public runtime into every page and ships the rest as hosted files', async () => {
    const bundle = await buildCanvasPublishBundle(storage, manifest, 'https://cdn.test/v1/r.js');

    expect(bundle.html).toContain('<script defer src="https://cdn.test/v1/r.js"></script>');
    expect(bundle.html).not.toContain('data-lobe-canvas-bridge');
    expect(bundle.files.map((file) => file.path)).toEqual([
      '/about/index.html',
      '/logo.png',
      '/styles.css',
    ]);
    expect(bundle.files[0]).toMatchObject({ encoding: 'utf8' });
    expect(bundle.files[0].content).toContain('https://cdn.test/v1/r.js');
    expect(bundle.files[1]).toEqual({
      content: Buffer.from([1, 2, 3]).toString('base64'),
      contentType: 'image/png',
      encoding: 'base64',
      path: '/logo.png',
    });
    expect(bundle.files[2]).toMatchObject({ content: 'body{}', encoding: 'utf8' });
  });
});

describe('resolveCanvasPublicRuntimeUrl', () => {
  it('needs an absolute runtime URL because published sites live on another origin', () => {
    expect(resolveCanvasPublicRuntimeUrl(1, { appUrl: 'https://app.test/' })).toBe(
      'https://app.test/canvas-runtime/v1/canvas-runtime.js',
    );
    expect(
      resolveCanvasPublicRuntimeUrl(1, {
        appUrl: 'https://app.test',
        baseUrl: 'https://cdn.test/rt/',
      }),
    ).toBe('https://cdn.test/rt/v1/canvas-runtime.js');
    expect(resolveCanvasPublicRuntimeUrl(1, {})).toBeUndefined();
  });
});
