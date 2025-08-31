import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { ICON_SIZE_TINY } from '@/const/common';

import FullFeatured from './FullFeatured';
import { TokenDisplay } from './components/TokenDisplay';
import { HighlighterProvider, supportedLanguageIds } from './contexts/highlighter';
import { useStyles } from './style';

export const FALLBACK_LANG = 'markdown';

interface HighlighterProps {
  /**
   * Whether to allow changing the language.
   */
  allowChangeLanguage?: boolean;
  /**
   * The code to be highlighted.
   */
  code: string;
  /**
   * Whether the code can be copied.
   */
  copyable?: boolean;
  /**
   * Whether the code is expanded by default.
   */
  defalutExpand?: boolean;
  fileName?: string;
  fullFeatured?: boolean;
  lang?: string;
  /**
   * Callback function called when code is copied.
   */
  onCopy?: (code: string) => void;
  showLanguage?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Highlighter: React.FC<HighlighterProps> = ({
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
  const { styles, token } = useStyles();
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
    <View style={[styles.container, style]}>
      {copyable && (
        <Pressable onPress={handleCopy} style={styles.simpleCopyButton}>
          {copied ? (
            <Check color={token.colorSuccess} size={ICON_SIZE_TINY} />
          ) : (
            <Copy color={token.colorText} size={ICON_SIZE_TINY} />
          )}
        </Pressable>
      )}

      <TokenDisplay code={code} lang={matchedLanguage} />
    </View>
  );
};

export default ({ ...props }: HighlighterProps) => {
  return (
    <HighlighterProvider>
      <Highlighter {...props} />
    </HighlighterProvider>
  );
};
