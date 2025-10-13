import * as Clipboard from 'expo-clipboard';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react-native';
import type { FC } from 'react';
import { useState } from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import Icon from '@/components/Icon';

import { LanguageSelect } from './components/LanguageSelect';
import { TokenDisplay } from './components/TokenDisplay';
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

const FullFeatured: FC<FullFeaturedProps> = ({
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
  const [expanded, setExpanded] = useState(defalutExpand);
  const { styles, theme } = useStyles();
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(lang);

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
      <View style={[styles.headerContainer]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => setExpanded(!expanded)} style={styles.expandIcon}>
            {expanded ? (
              <Icon icon={ChevronDown} size="small" />
            ) : (
              <Icon icon={ChevronRight} size="small" />
            )}
          </Pressable>
        </View>

        {allowChangeLanguage && showLanguage ? (
          <LanguageSelect onSelect={handleLanguageChange} value={language} />
        ) : (
          (showLanguage || fileName) && (
            <Text style={styles.headerTitle}>{fileName || language}</Text>
          )
        )}

        <View style={styles.headerRight}>
          {copyable && (
            <Pressable onPress={handleCopy} style={styles.copyButton}>
              {copied ? (
                <Icon color={theme.colorSuccess} icon={Check} size="small" />
              ) : (
                <Icon icon={Copy} size="small" />
              )}
            </Pressable>
          )}
        </View>
      </View>
      {expanded && <TokenDisplay code={code} lang={language} />}
    </View>
  );
};

export default FullFeatured;
