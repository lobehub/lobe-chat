import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';
import { Pressable } from 'react-native';

import Block from '@/components/Block';
import Icon from '@/components/Icon';

import FullFeatured from './FullFeatured';
import { TokenDisplay } from './components/TokenDisplay';
import { HighlighterProvider, supportedLanguageIds } from './contexts/highlighter';
import { useStyles } from './style';
import type { HighlighterProps } from './type';

export const FALLBACK_LANG = 'markdown';

const Highlighter = memo<HighlighterProps>(
  ({
    code,
    lang = 'markdown',
    fullFeatured = false,
    copyable = true,
    showLanguage = true,
    fileName,
    defalutExpand = true,
    allowChangeLanguage = false,
    style,
    onCopy,
  }) => {
    const { styles, theme } = useStyles();
    const [copied, setCopied] = useState(false);
    const language = lang.toLowerCase();
    const matchedLanguage = supportedLanguageIds.includes(language) ? language : FALLBACK_LANG;

    const handleCopy = async () => {
      try {
        await Clipboard.setStringAsync(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        onCopy?.(code);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };

    if (fullFeatured) {
      return (
        <FullFeatured
          allowChangeLanguage={allowChangeLanguage}
          code={code}
          copyable={copyable}
          defalutExpand={defalutExpand}
          fileName={fileName}
          lang={matchedLanguage}
          onCopy={onCopy}
          showLanguage={showLanguage}
          style={style}
        />
      );
    }

    return (
      <Block style={[styles.container, style]} testID="highlighter" variant={'outlined'}>
        {copyable && (
          <Pressable
            onPress={handleCopy}
            style={styles.simpleCopyButton}
            testID="highlighter-copy-button"
          >
            {copied ? (
              <Icon color={theme.colorSuccess} icon={Check} size="small" />
            ) : (
              <Icon color={theme.colorText} icon={Copy} size="small" />
            )}
          </Pressable>
        )}

        <TokenDisplay code={code} lang={matchedLanguage} />
      </Block>
    );
  },
);

Highlighter.displayName = 'Highlighter';

const HighlighterWithProvider = memo<HighlighterProps>(({ ...props }) => {
  return (
    <HighlighterProvider>
      <Highlighter {...props} />
    </HighlighterProvider>
  );
});

HighlighterWithProvider.displayName = 'HighlighterWithProvider';

export default HighlighterWithProvider;
