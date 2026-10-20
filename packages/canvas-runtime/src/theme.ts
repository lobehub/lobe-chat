import { type LobeThemeState, setLobeTheme } from '@lobehub/ui';

declare global {
  interface Window {
    __LOBE_CANVAS_THEME__?: Partial<LobeThemeState>;
  }
}

const systemAppearance = () =>
  matchMedia('(prefers-color-scheme: dark)').matches ? ('dark' as const) : ('light' as const);

export const startThemeSync = () => {
  let hostTheme = window.__LOBE_CANVAS_THEME__;

  const apply = () => {
    const appearance = hostTheme?.appearance ?? systemAppearance();
    setLobeTheme({ ...hostTheme, appearance });
    document.documentElement.style.colorScheme = appearance;
  };

  window.addEventListener('lobe-canvas-theme', (event) => {
    hostTheme = (event as CustomEvent<Partial<LobeThemeState>>).detail;
    apply();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!hostTheme?.appearance) apply();
  });

  apply();
};
