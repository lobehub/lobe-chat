import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import stylex from '@stylexjs/unplugin/vite';
import type { Plugin, PluginOption } from 'vite';

const findRepoRoot = (start: string) => {
  let dir = start;
  for (;;) {
    if (existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return;
    dir = parent;
  }
};

const repoRootFromMeta = () => {
  const url = import.meta.url;
  if (!url.startsWith('file:')) return;
  return path.resolve(fileURLToPath(new URL('../..', url)));
};

const repoRoot =
  [repoRootFromMeta(), findRepoRoot(process.cwd())].find(
    (dir) => dir && existsSync(path.join(dir, 'pnpm-workspace.yaml')),
  ) ?? process.cwd();

const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';

// Uncompiled defineConsts. Pre-bundling them removes the call before StyleX can
// inline var(--lobe-*) and the media queries.
export const stylexTokenModules = [
  '@lobehub/ui/stylex/cssVar.stylex',
  '@lobehub/ui/stylex/media.stylex',
] as const;

export const stylexProxiedDevCssModuleId = 'virtual:lobe-stylex-dev-css';

// The proxied SPA's document origin is Next. A root-relative fetch of
// /virtual:stylex.css never reaches Vite, and the unplugin runtime then disables
// the stylesheet link that does. This module is served by Vite, so import.meta.url
// stays on that origin.
const stylexProxiedDevCssShim = `
const STYLE_ID = '__stylex_virtual__';
const AFTER_UPDATE_DELAY = 180;
let lastCSS = '';

function ensure() {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }
  return el;
}

function disableLink() {
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    if (typeof link.href === 'string' && link.href.includes('/virtual:stylex.css')) {
      link.disabled = true;
    }
  }
}

function cssHref() {
  const moduleUrl = import.meta.url;
  const origin = moduleUrl.slice(0, moduleUrl.indexOf('/', moduleUrl.indexOf('//') + 2));
  return origin + '/virtual' + ':stylex.css';
}

async function update() {
  try {
    const response = await fetch(cssHref() + '?t=' + Date.now(), { cache: 'no-store' });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || !type.includes('text/css')) return;
    const css = await response.text();
    if (!css || css === lastCSS) return;
    ensure().textContent = css;
    disableLink();
    lastCSS = css;
  } catch (error) {
    console.error(error);
  }
}

update();

if (import.meta.hot) {
  import.meta.hot.on('stylex:css-update', update);
  import.meta.hot.on('vite:afterUpdate', () => setTimeout(update, AFTER_UPDATE_DELAY));
}
`;

function stylexProxiedDevCssPlugin(): Plugin {
  const resolvedId = `\0${stylexProxiedDevCssModuleId}`;
  return {
    apply: 'serve',
    load(id) {
      if (id === resolvedId) return stylexProxiedDevCssShim;
    },
    name: 'lobe-stylex-dev-css',
    resolveId(id) {
      if (id === stylexProxiedDevCssModuleId || id === resolvedId) return resolvedId;
    },
  };
}

export function stylexPlugin(): PluginOption {
  const plugin = stylex({
    aliases: {
      '@/*': [path.join(repoRoot, 'src/*')],
    },
    classNamePrefix: 'lh',
    dev: !isTest && process.env.NODE_ENV !== 'production',
    // Keep :dir() and logical properties. lightningcss would otherwise rewrite them
    // for the default browserslist and break StyleX RTL rules.
    lightningcssOptions: {
      exclude: 4 | 524_288,
    },
    runtimeInjection: isTest,
    test: isTest,
    unstable_moduleResolution: {
      rootDir: repoRoot,
      type: 'commonJS',
    },
  });

  const plugins = (Array.isArray(plugin) ? plugin : [plugin]) as Array<{
    config?: unknown;
    configureServer?: unknown;
  }>;
  for (const item of plugins) {
    // @lobehub/ui depends on @stylexjs/stylex but ships precompiled CSS. This hook
    // would pull that package out of dependency pre-bundling.
    delete item.config;
    // The unplugin polls a shared CSS store from configureServer and keeps Vitest's
    // Vite server alive after the run.
    if (isTest) delete item.configureServer;
  }

  plugins.push(stylexProxiedDevCssPlugin());

  return plugins as PluginOption;
}
