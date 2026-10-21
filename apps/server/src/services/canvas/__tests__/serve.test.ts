// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CANVAS_PREVIEW_TTL_BUCKET_SECONDS,
  CANVAS_PREVIEW_TTL_SECONDS,
  injectCanvasRuntime,
  serveCanvasFile,
  signCanvasPreviewToken,
  verifyCanvasPreviewToken,
} from '../serve';
import type { CanvasStorageService } from '../storage';

const manifest = {
  entry: 'index.html',
  files: {
    'data.json': { contentType: 'application/json; charset=utf-8', hash: 'h2', size: 5 },
    'index.html': { contentType: 'text/html; charset=utf-8', hash: 'h1', size: 40 },
  },
  runtimeMajor: 1,
  schemaVersion: 1 as const,
};

const storageFor = (files: Record<string, string>) =>
  ({
    readFile: vi.fn(async (_manifest: unknown, path: string) =>
      path in files
        ? {
            bytes: new TextEncoder().encode(files[path]),
            contentType: manifest.files[path as keyof typeof manifest.files].contentType,
          }
        : undefined,
    ),
    readManifest: vi.fn(async () => manifest),
  }) as unknown as CanvasStorageService;

beforeEach(() => {
  vi.stubEnv('KEY_VAULTS_SECRET', 'test-secret');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('canvas preview tokens', () => {
  it('round-trips a signed token', () => {
    const token = signCanvasPreviewToken({
      manifestKey: 'canvas/u/c/manifests/a.json',
      userId: 'u',
    });

    expect(verifyCanvasPreviewToken(token)).toMatchObject({
      manifestKey: 'canvas/u/c/manifests/a.json',
      userId: 'u',
    });
  });

  it('rejects a tampered or expired token', () => {
    const token = signCanvasPreviewToken({ manifestKey: 'k', userId: 'u' });
    const [body, signature] = token.split('.');
    const forged = `${Buffer.from(JSON.stringify({ e: 9_999_999_999, k: 'k', u: 'other' })).toString('base64url')}.${signature}`;

    expect(verifyCanvasPreviewToken(forged)).toBeUndefined();
    expect(verifyCanvasPreviewToken(`${body}.`)).toBeUndefined();

    vi.useFakeTimers();
    vi.setSystemTime(
      Date.now() + (CANVAS_PREVIEW_TTL_SECONDS + CANVAS_PREVIEW_TTL_BUCKET_SECONDS + 5) * 1000,
    );
    expect(verifyCanvasPreviewToken(token)).toBeUndefined();
  });

  it('keeps the token stable within a time bucket so the preview frame does not reload', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T10:00:00Z'));
    const first = signCanvasPreviewToken({ manifestKey: 'k', userId: 'u' });
    vi.setSystemTime(new Date('2026-10-20T10:04:00Z'));

    expect(signCanvasPreviewToken({ manifestKey: 'k', userId: 'u' })).toBe(first);
  });
});

describe('injectCanvasRuntime', () => {
  it('adds the publication runtime right after <head>', () => {
    const html = injectCanvasRuntime(
      '<!doctype html><html><head><title>x</title></head><body></body></html>',
      {
        runtimeUrl: '/canvas-runtime/v1/canvas-runtime.js',
      },
    );

    expect(html).toContain('<head><script defer');
    expect(html).toContain('<script defer src="/canvas-runtime/v1/canvas-runtime.js"></script>');
    expect(html.indexOf('canvas-runtime.js')).toBeLessThan(html.indexOf('<title>'));
  });

  it('wraps a fragment that has no <head>', () => {
    const html = injectCanvasRuntime('<lobe-tag>x</lobe-tag>', { runtimeUrl: '/r.js' });

    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<lobe-tag>x</lobe-tag>');
    expect(html).toContain('<script defer src="/r.js"></script>');
  });
});

describe('serveCanvasFile', () => {
  const token = () =>
    signCanvasPreviewToken({ manifestKey: 'canvas/u/c/manifests/a.json', userId: 'u' });

  it('serves the entry page with the runtime injected and a locked-down CSP', async () => {
    const storage = storageFor({ 'index.html': '<html><head></head><body>hi</body></html>' });

    const response = await serveCanvasFile({
      createStorage: () => storage,
      path: '',
      runtimeUrl: '/canvas-runtime/v1/canvas-runtime.js',
      token: token(),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'self'");
    expect(response.headers.get('content-security-policy')).toContain("default-src 'none'");
    const html = await response.text();
    expect(html).toContain('data-lobe-canvas-bridge');
    expect(html).not.toContain('<script defer src=');
    expect(response.headers.get('content-security-policy')).toContain(
      "script-src 'self' 'unsafe-inline' blob:",
    );
  });

  it('sandboxes every response into an opaque origin even when opened top-level', async () => {
    const response = await serveCanvasFile({
      createStorage: () => storageFor({ 'data.json': '[1,2]' }),
      path: 'data.json',
      runtimeUrl: '/r.js',
      token: token(),
    });
    const csp = response.headers.get('content-security-policy')!;

    expect(csp).toMatch(
      /(^|; )sandbox allow-scripts allow-popups allow-forms allow-downloads(;|$)/,
    );
    expect(csp).not.toContain('allow-same-origin');
  });

  it('serves project files as-is and allows the opaque sandbox origin to read them', async () => {
    const response = await serveCanvasFile({
      createStorage: () => storageFor({ 'data.json': '[1,2]' }),
      path: 'data.json',
      runtimeUrl: '/r.js',
      token: token(),
    });

    expect(await response.text()).toBe('[1,2]');
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
  });

  it('answers 403 for a bad token and 404 for a missing file', async () => {
    const createStorage = () => storageFor({});

    expect(
      (await serveCanvasFile({ createStorage, path: '', runtimeUrl: '/r.js', token: 'nope' }))
        .status,
    ).toBe(403);
    expect(
      (
        await serveCanvasFile({
          createStorage,
          path: 'missing.css',
          runtimeUrl: '/r.js',
          token: token(),
        })
      ).status,
    ).toBe(404);
  });

  it('answers 404 instead of the entry page for a path that escapes the project', async () => {
    const response = await serveCanvasFile({
      createStorage: () =>
        storageFor({ 'index.html': '<html><head></head><body>hi</body></html>' }),
      path: '../../package.json',
      runtimeUrl: '/r.js',
      token: token(),
    });

    expect(response.status).toBe(404);
  });
});
