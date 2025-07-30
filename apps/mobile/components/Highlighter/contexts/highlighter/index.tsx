import { type HighlighterCore, createHighlighterCore } from '@shikijs/core';
import bash from '@shikijs/langs/dist/bash.mjs';
import c from '@shikijs/langs/dist/c.mjs';
import cpp from '@shikijs/langs/dist/cpp.mjs';
import csharp from '@shikijs/langs/dist/csharp.mjs';
import css from '@shikijs/langs/dist/css.mjs';
import diff from '@shikijs/langs/dist/diff.mjs';
import go from '@shikijs/langs/dist/go.mjs';
import graphql from '@shikijs/langs/dist/graphql.mjs';
import html from '@shikijs/langs/dist/html.mjs';
import ini from '@shikijs/langs/dist/ini.mjs';
import java from '@shikijs/langs/dist/java.mjs';
import javascript from '@shikijs/langs/dist/javascript.mjs';
import json from '@shikijs/langs/dist/json.mjs';
import jsx from '@shikijs/langs/dist/jsx.mjs';
import kotlin from '@shikijs/langs/dist/kotlin.mjs';
import markdown from '@shikijs/langs/dist/markdown.mjs';
import mermaid from '@shikijs/langs/dist/mermaid.mjs';
import php from '@shikijs/langs/dist/php.mjs';
import python from '@shikijs/langs/dist/python.mjs';
import ruby from '@shikijs/langs/dist/ruby.mjs';
// 导入常用语言 - 避免使用 bundledLanguages 以防止 WebAssembly 相关问题
import rust from '@shikijs/langs/dist/rust.mjs';
import scala from '@shikijs/langs/dist/scala.mjs';
import sql from '@shikijs/langs/dist/sql.mjs';
import swift from '@shikijs/langs/dist/swift.mjs';
import toml from '@shikijs/langs/dist/toml.mjs';
import tsx from '@shikijs/langs/dist/tsx.mjs';
import typescript from '@shikijs/langs/dist/typescript.mjs';
import xml from '@shikijs/langs/dist/xml.mjs';
import yaml from '@shikijs/langs/dist/yaml.mjs';
import React, { useEffect, useMemo, useState } from 'react';
import { createNativeEngine, isNativeEngineAvailable } from 'react-native-shiki-engine';

import { themeConfig } from '../../theme';
import type { HighlighterContextType } from './context';
import { HighlighterContext } from './context';

let highlighterInstance: HighlighterCore | null = null;
let initializationPromise: Promise<void> | null = null;

// 创建一个对象，利用JavaScript对象属性名来获取语言ID
const languagesObj = {
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  go,
  graphql,
  html,
  ini,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  markdown,
  mermaid,
  php,
  python,
  ruby,
  rust,
  scala,
  sql,
  swift,
  toml,
  tsx,
  typescript,
  xml,
  yaml,
};

// 支持的语言ID列表 - 直接从对象的键名获取
export const supportedLanguageIds = Object.keys(languagesObj);

// 支持的常用语言列表 - 从对象的值获取
export const supportedLanguages = Object.values(languagesObj);

export function HighlighterProvider({ children }: { children: React.ReactNode }) {
  const darkTheme = useMemo(() => themeConfig(true), []);
  const lightTheme = useMemo(() => themeConfig(false), []);
  const [isLoading, setIsLoading] = useState(true);

  // 在 Provider 中初始化
  useEffect(() => {
    const init = async () => {
      if (!initializationPromise) {
        initializationPromise = (async () => {
          const available = isNativeEngineAvailable();
          if (!available) throw new Error('Native engine not available.');

          highlighterInstance = await createHighlighterCore({
            engine: createNativeEngine(),
            langs: supportedLanguages,
            themes: [darkTheme, lightTheme],
          });
        })();
      }

      await initializationPromise;
      setIsLoading(false);
    };
    init();
  }, []);

  const value = React.useMemo<HighlighterContextType>(
    () => ({
      dispose: () => {
        if (highlighterInstance) {
          highlighterInstance.dispose();
          highlighterInstance = null;
          initializationPromise = null;
        }
      },

      initialize: async () => {
        if (!initializationPromise) {
          throw new Error('Highlighter initialization failed');
        }
        await initializationPromise;
      },

      isLoading,

      tokenize: (code: string, options: { lang: string; theme: string }) => {
        if (!highlighterInstance) {
          throw new Error('Highlighter not initialized. Call initialize() first.');
        }
        return highlighterInstance.codeToTokensBase(code, options);
      },
    }),
    [isLoading],
  );

  return <HighlighterContext.Provider value={value}>{children}</HighlighterContext.Provider>;
}
