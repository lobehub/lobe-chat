import type { CANVAS_CODE_LANGUAGES } from '@lobechat/canvas';
import { ShikiLobeTheme } from '@lobehub/ui';
import {
  createHighlighterCore,
  type HighlighterCore,
  type LanguageRegistration,
  type ThemeRegistration,
} from 'shiki/core';
import c from 'shiki/dist/langs/c.mjs';
import cpp from 'shiki/dist/langs/cpp.mjs';
import csharp from 'shiki/dist/langs/csharp.mjs';
import css from 'shiki/dist/langs/css.mjs';
import diff from 'shiki/dist/langs/diff.mjs';
import dockerfile from 'shiki/dist/langs/dockerfile.mjs';
import go from 'shiki/dist/langs/go.mjs';
import html from 'shiki/dist/langs/html.mjs';
import java from 'shiki/dist/langs/java.mjs';
import javascript from 'shiki/dist/langs/javascript.mjs';
import json from 'shiki/dist/langs/json.mjs';
import jsx from 'shiki/dist/langs/jsx.mjs';
import kotlin from 'shiki/dist/langs/kotlin.mjs';
import python from 'shiki/dist/langs/python.mjs';
import ruby from 'shiki/dist/langs/ruby.mjs';
import rust from 'shiki/dist/langs/rust.mjs';
import shellscript from 'shiki/dist/langs/shellscript.mjs';
import sql from 'shiki/dist/langs/sql.mjs';
import swift from 'shiki/dist/langs/swift.mjs';
import toml from 'shiki/dist/langs/toml.mjs';
import tsx from 'shiki/dist/langs/tsx.mjs';
import typescript from 'shiki/dist/langs/typescript.mjs';
import yaml from 'shiki/dist/langs/yaml.mjs';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { registerCanvasAddon } from './registry';

export const CODE_GRAMMARS: Record<(typeof CANVAS_CODE_LANGUAGES)[number], LanguageRegistration[]> =
  {
    bash: shellscript,
    c,
    cpp,
    csharp,
    css,
    diff,
    dockerfile,
    go,
    html,
    java,
    javascript,
    json,
    jsx,
    kotlin,
    python,
    ruby,
    rust,
    sql,
    swift,
    toml,
    tsx,
    typescript,
    yaml,
  };

const PLAIN_TEXT = 'text';

const LOBE_THEME = ShikiLobeTheme as ThemeRegistration;

let highlighter: Promise<HighlighterCore> | undefined;

const getHighlighter = () => {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine({ forgiving: true }),
    langs: Object.values(CODE_GRAMMARS),
    themes: [LOBE_THEME],
  });
  return highlighter;
};

export const highlightCode = async (code: string, language?: string) => {
  const instance = await getHighlighter();
  const requested = language?.trim().toLowerCase();
  const lang =
    requested && instance.getLoadedLanguages().includes(requested) ? requested : PLAIN_TEXT;
  return instance.codeToHtml(code, { lang, theme: LOBE_THEME.name! });
};

if (typeof window !== 'undefined') registerCanvasAddon('highlight', { highlight: highlightCode });
