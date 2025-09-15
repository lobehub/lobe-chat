import { type HighlighterCore, createHighlighterCore } from '@shikijs/core';
import bash from '@shikijs/langs/bash';
import c from '@shikijs/langs/c';
import css from '@shikijs/langs/css';
import go from '@shikijs/langs/go';
import html from '@shikijs/langs/html';
import java from '@shikijs/langs/java';
import javascript from '@shikijs/langs/javascript';
import json from '@shikijs/langs/json';
import jsx from '@shikijs/langs/jsx';
import kotlin from '@shikijs/langs/kotlin';
import markdown from '@shikijs/langs/markdown';
import php from '@shikijs/langs/php';
import python from '@shikijs/langs/python';
import ruby from '@shikijs/langs/ruby';
import sql from '@shikijs/langs/sql';
import swift from '@shikijs/langs/swift';
import tsx from '@shikijs/langs/tsx';
import typescript from '@shikijs/langs/typescript';
import xml from '@shikijs/langs/xml';
import yaml from '@shikijs/langs/yaml';
import React, { useEffect, useMemo, useState } from 'react';
import { createNativeEngine, isNativeEngineAvailable } from 'react-native-shiki-engine';

import { themeConfig } from '@/components/Highlighter/theme';
import type { HighlighterContextType } from './context';
import { HighlighterContext } from './context';

let highlighterInstance: HighlighterCore | null = null;
let initializationPromise: Promise<void> | null = null;

// 创建一个对象，利用JavaScript对象属性名来获取语言ID
const languagesObj = {
  bash,
  c,
  css,
  go,
  html,
  java,
  javascript,
  json,
  jsx,
  kotlin,
  markdown,
  php,
  python,
  ruby,
  sql,
  swift,
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
