import { defaultTheme, githubTheme, serifTheme } from './themes';

export const themes = {
  defaultTheme,
  githubTheme,
  serifTheme,
};

export { useMarkdownContext } from './context';
export { Markdown } from './markdown';
export { RendererArgs, Renderers, RenderFunc } from './renderers';
export { Theme } from './themes';
