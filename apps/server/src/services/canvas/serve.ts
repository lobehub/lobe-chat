import { createHmac, timingSafeEqual } from 'node:crypto';

import { CANVAS_ENTRY, getCanvasFileExtension, normalizeCanvasPath } from '@lobechat/canvas';
import { installCanvasBridge } from '@lobechat/canvas/runtime';

import type { CanvasStorageService } from './storage';

export const CANVAS_PREVIEW_TTL_SECONDS = 60 * 60;
export const CANVAS_PREVIEW_TTL_BUCKET_SECONDS = 15 * 60;

export interface CanvasPreviewTokenPayload {
  manifestKey: string;
  userId: string;
  workspaceId?: string;
}

interface EncodedPayload {
  e: number;
  k: string;
  u: string;
  w?: string;
}

const secret = () => {
  const value = process.env.KEY_VAULTS_SECRET;
  if (!value) throw new Error('`KEY_VAULTS_SECRET` is required to sign canvas preview URLs');
  return value;
};

const sign = (body: string) =>
  createHmac('sha256', secret()).update(`canvas-preview:${body}`).digest('base64url');

export const signCanvasPreviewToken = (
  payload: CanvasPreviewTokenPayload,
  ttlSeconds = CANVAS_PREVIEW_TTL_SECONDS,
) => {
  const bucket = CANVAS_PREVIEW_TTL_BUCKET_SECONDS;
  const encoded: EncodedPayload = {
    e: (Math.floor(Date.now() / 1000 / bucket) + 1) * bucket + ttlSeconds,
    k: payload.manifestKey,
    u: payload.userId,
    ...(payload.workspaceId && { w: payload.workspaceId }),
  };
  const body = Buffer.from(JSON.stringify(encoded)).toString('base64url');
  return `${body}.${sign(body)}`;
};

export const verifyCanvasPreviewToken = (token: string): CanvasPreviewTokenPayload | undefined => {
  const [body, signature] = token.split('.');
  if (!body || !signature) return;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as EncodedPayload;
    if (payload.e * 1000 < Date.now()) return;
    return { manifestKey: payload.k, userId: payload.u, workspaceId: payload.w };
  } catch {
    return;
  }
};

const injectHead = (html: string, injection: string) => {
  const head = /<head(?:\s[^>]*)?>/i.exec(html);
  if (head) {
    const at = head.index + head[0].length;
    return `${html.slice(0, at)}${injection}${html.slice(at)}`;
  }
  return `<!doctype html><html><head><meta charset="utf-8">${injection}</head><body>${html}</body></html>`;
};

export const injectCanvasRuntime = (html: string, options: { runtimeUrl: string }) =>
  injectHead(html, `<script defer src="${options.runtimeUrl}"></script>`);

const injectCanvasPreview = (html: string, runtimeUrl: string) => {
  const fallback = JSON.stringify(runtimeUrl).replaceAll('<', String.raw`\u003c`);
  return injectHead(
    html,
    `<script data-lobe-canvas-bridge>(${installCanvasBridge.toString()})(${fallback});</script>`,
  );
};

const contentSecurityPolicy = (runtimeUrl: string) => {
  const runtimeOrigin = /^https?:\/\//.test(runtimeUrl) ? ` ${new URL(runtimeUrl).origin}` : '';
  return [
    'sandbox allow-scripts allow-popups allow-forms allow-downloads',
    "default-src 'none'",
    `script-src 'self' 'unsafe-inline' blob:${runtimeOrigin}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "form-action 'none'",
    "base-uri 'none'",
  ].join('; ');
};

export interface ServeCanvasFileParams {
  createStorage: (
    payload: CanvasPreviewTokenPayload,
  ) => Pick<CanvasStorageService, 'readFile' | 'readManifest'>;
  path: string;
  runtimeUrl: string;
  token: string;
}

export const serveCanvasFile = async ({
  createStorage,
  path,
  runtimeUrl,
  token,
}: ServeCanvasFileParams): Promise<Response> => {
  const payload = verifyCanvasPreviewToken(token);
  if (!payload) return new Response('Forbidden', { status: 403 });

  const requested = path ? normalizeCanvasPath(path) : undefined;
  if (path && !requested) return new Response('Not found', { status: 404 });

  const storage = createStorage(payload);
  const manifest = await storage.readManifest(payload.manifestKey);
  const target = requested || manifest.entry || CANVAS_ENTRY;
  const file = await storage.readFile(manifest, target);
  if (!file) return new Response('Not found', { status: 404 });

  const headers = new Headers({
    'access-control-allow-origin': '*',
    'cache-control': 'private, max-age=300',
    'content-security-policy': contentSecurityPolicy(runtimeUrl),
    'content-type': file.contentType,
    'x-content-type-options': 'nosniff',
  });

  if (getCanvasFileExtension(target) === 'html') {
    const html = injectCanvasPreview(new TextDecoder().decode(file.bytes), runtimeUrl);
    return new Response(html, { headers, status: 200 });
  }

  return new Response(new Blob([file.bytes as Uint8Array<ArrayBuffer>]), { headers, status: 200 });
};
