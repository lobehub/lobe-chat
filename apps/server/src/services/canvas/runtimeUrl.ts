import { CANVAS_ENTRY, CANVAS_RUNTIME_MAJOR } from '@lobechat/canvas';

export const CANVAS_RUNTIME_FILE = 'canvas-runtime.js';

export const resolveCanvasRuntimeUrl = (major = CANVAS_RUNTIME_MAJOR) => {
  const base = process.env.CANVAS_RUNTIME_BASE_URL?.replace(/\/$/, '') ?? '/canvas-runtime';
  return `${base}/v${major}/${CANVAS_RUNTIME_FILE}`;
};

// Next redirects a trailing-slash URL to its slashless form, which would resolve the
// project's relative file references one directory too high; address the entry file instead.
export const buildCanvasPreviewUrl = (token: string, entry = CANVAS_ENTRY) =>
  `/canvas-preview/${token}/${entry}`;
