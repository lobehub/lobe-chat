import '@lobehub/ui/theme.css';
import '@lobehub/ui/style.css';
import './base.css';

import { CANVAS_COMPONENTS } from '@lobechat/canvas';

import { defineCanvasElement } from './element';
import { type CanvasHostRoot, createHostRoot } from './host';
import { wrapCanvasTree } from './providers';
import { startThemeSync } from './theme';
import { baseViews } from './views/base';
import { chartViews } from './views/charts';

const views = { ...baseViews, ...chartViews };

const reportError = (error: unknown, host: HTMLElement) => {
  console.error('[lobe-canvas]', error);
  window.dispatchEvent(
    new CustomEvent('lobe-canvas-component-error', {
      detail: {
        message: error instanceof Error ? error.message : String(error),
        tag: host.tagName.toLowerCase(),
      },
    }),
  );
};

if (typeof window !== 'undefined' && !customElements.get('lobe-flex')) {
  startThemeSync();

  let hosts: CanvasHostRoot | undefined;
  const getHosts = () => {
    hosts ??= createHostRoot({
      onError: reportError,
      wrap: wrapCanvasTree,
    });
    return hosts;
  };

  for (const spec of CANVAS_COMPONENTS) {
    customElements.define(
      spec.tag,
      defineCanvasElement(spec, views[spec.tag] ?? (() => null), getHosts),
    );
  }

  document.dispatchEvent(new CustomEvent('lobe-canvas:ready'));
}
