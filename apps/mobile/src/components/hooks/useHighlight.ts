import type { HighlighterCore, ThemedToken } from '@shikijs/core';
import { createHighlighterCore } from '@shikijs/core';
// Static imports for all supported languages
import slackDark from '@shikijs/themes/slack-dark';
import slackOchin from '@shikijs/themes/slack-ochin';
import { useMemo } from 'react';
import { createNativeEngine, isNativeEngineAvailable } from 'react-native-shiki-engine';
import type { BuiltinTheme } from 'shiki';
import type { SWRResponse } from 'swr';
import useSWR from 'swr';
import { Md5 } from 'ts-md5';

import { useTheme, useThemeMode } from '@/components/styles';

import { getCodeLanguageByInput, supportedLanguages } from '../Highlighter/const';

// Application-level cache to avoid repeated calculations
const MD5_LENGTH_THRESHOLD = 10_000; // Use async MD5 for text exceeding this length

// Color replacement mapping type
type ColorReplacements = {
  [themeName: string]: {
    [originalColor: string]: string;
  };
};

// Singleton highlighter instance
let highlighterInstance: HighlighterCore | null = null;
let initializationPromise: Promise<HighlighterCore> | null = null;

/**
 * Lazy load and initialize highlighter
 * Creates singleton instance for the entire app
 */
const loadShiki = async (): Promise<HighlighterCore> => {
  if (highlighterInstance) return highlighterInstance;
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    const available = isNativeEngineAvailable();
    if (!available) {
      throw new Error('Native shiki engine not available.');
    }
    // Create highlighter with all supported languages
    highlighterInstance = await createHighlighterCore({
      engine: createNativeEngine(),
      langs: supportedLanguages,
      themes: [slackDark, slackOchin],
    });
    return highlighterInstance;
  })();
  return initializationPromise;
};

// Start loading immediately
const shikiPromise = loadShiki();

export const useHighlight = (
  text: string,
  { language, theme: builtinTheme }: { language: string; theme?: BuiltinTheme },
): SWRResponse<ThemedToken[][], Error> => {
  // Use theme hooks - aligned with web version
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();

  // Match supported languages using the same logic as web
  const matchedLanguage = useMemo(() => getCodeLanguageByInput(language), [language]);

  // Optimize color replacement configuration
  const colorReplacements = useMemo(
    (): ColorReplacements => ({
      'slack-dark': {
        '#4ec9b0': theme.yellow,
        '#569cd6': theme.colorError,
        '#6a9955': theme.gray,
        '#9cdcfe': theme.colorText,
        '#b5cea8': theme.purple10,
        '#c586c0': theme.colorInfo,
        '#ce9178': theme.colorSuccess,
        '#dcdcaa': theme.colorWarning,
        '#e6e6e6': theme.colorText,
      },
      'slack-ochin': {
        '#002339': theme.colorText,
        '#0444ac': theme.geekblue,
        '#0991b6': theme.colorError,
        '#174781': theme.purple10,
        '#2f86d2': theme.colorText,
        '#357b42': theme.gray,
        '#7b30d0': theme.colorInfo,
        '#7eb233': theme.colorWarningTextActive,
        '#a44185': theme.colorSuccess,
        '#dc3eb7': theme.yellow11,
      },
    }),
    [theme],
  );

  // Build cache key
  const cacheKey = useMemo((): string | null => {
    // Use hash for long text
    const hash = text.length < MD5_LENGTH_THRESHOLD ? text : Md5.hashStr(text);
    return [matchedLanguage, builtinTheme || (isDarkMode ? 'd' : 'l'), hash]
      .filter(Boolean)
      .join('-');
  }, [text, matchedLanguage, isDarkMode, builtinTheme]);

  // Use SWR to get highlighted tokens
  return useSWR(
    cacheKey,
    async (): Promise<ThemedToken[][]> => {
      try {
        // Get highlighter instance
        const highlighter = await shikiPromise;

        // Tokenize with matched language
        const tokens = await highlighter.codeToTokensBase(text.trimEnd(), {
          colorReplacements,
          lang: matchedLanguage,
          theme: isDarkMode ? 'slack-dark' : 'slack-ochin',
        });

        return tokens;
      } catch {
        try {
          // Fallback: try with javascript
          const highlighter = await shikiPromise;
          const tokens = await highlighter.codeToTokensBase(text.trimEnd(), {
            colorReplacements,
            lang: 'plaintext',
            theme: isDarkMode ? 'slack-dark' : 'slack-ochin',
          });
          return tokens;
        } catch (fallbackErr) {
          // Final fallback: return empty tokens
          console.error('Fallback tokenization failed:', fallbackErr);
          throw fallbackErr;
        }
      }
    },
    {
      dedupingInterval: 3000, // Only execute once for the same request within 3 seconds
      errorRetryCount: 2, // Retry at most 2 times
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export { loadShiki, MD5_LENGTH_THRESHOLD, shikiPromise };
