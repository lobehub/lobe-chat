import * as Clipboard from 'expo-clipboard';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import ActionIcon from '@/components/ActionIcon';
import Block from '@/components/Block';
import Text from '@/components/Text';

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

const FullFeatured = memo<FullFeaturedProps>(
  ({
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
      <Block
        style={[styles.container, style]}
        testID="highlighter-full-featured"
        variant={'outlined'}
      >
        <View style={[styles.headerContainer]}>
          <View style={styles.headerLeft}>
            <ActionIcon
              color={theme.colorTextDescription}
              icon={expanded ? ChevronDown : ChevronRight}
              onPress={() => setExpanded(!expanded)}
              size="small"
            />
          </View>

          {allowChangeLanguage && showLanguage ? (
            <LanguageSelect onSelect={handleLanguageChange} value={language} />
          ) : (
            (showLanguage || fileName) && (
              <Text code fontSize={12} type={'secondary'}>
                {fileName || language}
              </Text>
            )
          )}

          <View style={styles.headerRight}>
            {copyable && (
              <ActionIcon
                color={copied ? theme.colorSuccess : theme.colorTextDescription}
                icon={copied ? Check : Copy}
                onPress={handleCopy}
                size="small"
              />
            )}
          </View>
        </View>
        {expanded && <TokenDisplay code={code} lang={language} />}
      </Block>
    );
  },
);

FullFeatured.displayName = 'FullFeatured';

export default FullFeatured;
