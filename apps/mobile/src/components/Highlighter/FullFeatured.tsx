import * as Clipboard from 'expo-clipboard';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import { ICON_SIZE_TINY } from '@/const/common';
import { useTheme } from '@/theme';

import { LanguageSelect } from './components/LanguageSelect';
import { TokenDisplay } from './TokenDisplay';
import { useTokenize } from './hooks/useTokenize';
import { useStyles } from './style';

interface FullFeaturedProps {
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
  /**
   * The name of the file, if applicable.
   */
  fileName?: string;
  /**
   * The language of the code.
   */
  lang: string;
  /**
   * Callback function called when code is copied.
   */
  onCopy?: (code: string) => void;
  /**
   * Whether to show the language name in the header.
   */
  showLanguage?: boolean;
  /**
   * Custom styles for the component.
   */
  style?: StyleProp<ViewStyle>;
}

const FullFeatured: React.FC<FullFeaturedProps> = ({
  code,
  lang,
  copyable = true,
  showLanguage = true,
  fileName,
  defalutExpand = true,
  allowChangeLanguage = false,
  style,
  onCopy,
}) => {
  const { styles, token } = useStyles();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(defalutExpand);
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(lang);

  const { tokens, error } = useTokenize(code, language, theme.isDark ? 'dark' : 'light');

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

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandIcon}>
            {expanded ? (
              <ChevronDown color={token.colorText} size={18} />
            ) : (
              <ChevronRight color={token.colorText} size={18} />
            )}
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          {allowChangeLanguage && showLanguage ? (
            <LanguageSelect onSelect={handleLanguageChange} value={language} />
          ) : (
            (showLanguage || fileName) && (
              <Text style={styles.headerTitle}>{fileName || language}</Text>
            )
          )}
        </View>

        <View style={styles.headerRight}>
          {copyable && (
            <Pressable onPress={handleCopy} style={styles.copyButton}>
              {copied ? (
                <Check color={token.colorSuccess} size={ICON_SIZE_TINY} />
              ) : (
                <Copy color={token.colorText} size={ICON_SIZE_TINY} />
              )}
            </Pressable>
          )}
        </View>
      </View>
      {expanded &&
        (error ? (
          // 降级为纯文本
          <Text style={{ color: token.colorText, margin: token.paddingXS }}>{code}</Text>
        ) : (
          <TokenDisplay tokens={tokens} />
        ))}
    </View>
  );
};

export default FullFeatured;
