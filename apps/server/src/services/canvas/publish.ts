import {
  CANVAS_ENTRY,
  type CanvasManifest,
  getCanvasFileExtension,
  isCanvasTextPath,
} from '@lobechat/canvas';
import type { CanvasPublishBundle, CanvasPublishFile } from '@lobechat/types';

import { CANVAS_RUNTIME_FILE } from './runtimeUrl';
import { injectCanvasRuntime } from './serve';
import type { CanvasStorageService } from './storage';

const isAbsoluteUrl = (value: string) => /^https?:\/\//.test(value);

export const resolveCanvasPublicRuntimeUrl = (
  major: number,
  env: { appUrl?: string; baseUrl?: string },
): string | undefined => {
  const base = env.baseUrl?.replace(/\/$/, '');
  if (base && isAbsoluteUrl(base)) return `${base}/v${major}/${CANVAS_RUNTIME_FILE}`;
  if (!env.appUrl || !isAbsoluteUrl(env.appUrl)) return;
  return new URL(`${base ?? '/canvas-runtime'}/v${major}/${CANVAS_RUNTIME_FILE}`, env.appUrl).href;
};

export const buildCanvasPublishBundle = async (
  storage: Pick<CanvasStorageService, 'readFile'>,
  manifest: CanvasManifest,
  runtimeUrl: string,
): Promise<CanvasPublishBundle> => {
  const decoder = new TextDecoder();
  const entry = manifest.entry || CANVAS_ENTRY;
  let html = '';
  const files: CanvasPublishFile[] = [];

  for (const path of Object.keys(manifest.files).toSorted()) {
    const file = await storage.readFile(manifest, path);
    if (!file) throw new Error(`Canvas file ${path} is missing`);

    if (getCanvasFileExtension(path) === 'html') {
      const page = injectCanvasRuntime(decoder.decode(file.bytes), { runtimeUrl });
      if (path === entry) html = page;
      else
        files.push({
          content: page,
          contentType: file.contentType,
          encoding: 'utf8',
          path: `/${path}`,
        });
      continue;
    }

    files.push(
      isCanvasTextPath(path)
        ? {
            content: decoder.decode(file.bytes),
            contentType: file.contentType,
            encoding: 'utf8',
            path: `/${path}`,
          }
        : {
            content: Buffer.from(file.bytes).toString('base64'),
            contentType: file.contentType,
            encoding: 'base64',
            path: `/${path}`,
          },
    );
  }

  return { files, html };
};
