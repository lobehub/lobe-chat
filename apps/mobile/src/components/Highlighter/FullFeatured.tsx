import * as Clipboard from 'expo-clipboard';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import ActionIcon from '@/components/ActionIcon';
import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import MaterialFileTypeIcon from '@/components/MaterialFileTypeIcon';
import Text from '@/components/Text';

import LangSelect from './LangSelect';
import SyntaxHighlighter from './SyntaxHighlighter';
import { getCodeLanguageDisplayName, getCodeLanguageFilename } from './const';
import { useStyles } from './style';
import type { HighlighterProps } from './type';

interface HighlighterFullFeaturedProps extends HighlighterProps {
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

export const HighlighterFullFeatured = memo<HighlighterFullFeaturedProps>(
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
    variant,
    ...rest
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

    const displayName = fileName ? fileName : getCodeLanguageDisplayName(language);
    const filetype = fileName ? fileName : getCodeLanguageFilename(language);

    return (
      <Block
        style={[styles.container, style]}
        testID="highlighter-full-featured"
        variant={variant}
        {...rest}
      >
        <Flexbox
          align={'center'}
          horizontal
          justify={'space-between'}
          paddingBlock={6}
          paddingInline={8}
          style={{
            backgroundColor: theme.colorFillQuaternary,
          }}
        >
          <ActionIcon
            color={theme.colorTextDescription}
            icon={expanded ? ChevronDown : ChevronRight}
            onPress={() => setExpanded(!expanded)}
            size={14}
          />

          {allowChangeLanguage && showLanguage && !fileName ? (
            <LangSelect
              filetype={filetype}
              onSelect={handleLanguageChange}
              showIcon
              value={language}
            />
          ) : (
            (showLanguage || fileName) && (
              <Flexbox align={'center'} gap={6} horizontal>
                <MaterialFileTypeIcon
                  fallbackUnknownType={false}
                  filename={filetype}
                  size={16}
                  type="file"
                />
                <Text
                  code
                  color={theme.colorTextSecondary}
                  ellipsis
                  fontSize={12}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </Flexbox>
            )
          )}

          {copyable ? (
            <ActionIcon
              color={copied ? theme.colorSuccess : theme.colorTextDescription}
              icon={copied ? Check : Copy}
              onPress={handleCopy}
              size={14}
            />
          ) : (
            <Flexbox style={{ width: 14 }} />
          )}
        </Flexbox>
        {expanded && <SyntaxHighlighter language={language}>{code}</SyntaxHighlighter>}
      </Block>
    );
  },
);

HighlighterFullFeatured.displayName = 'HighlighterFullFeatured';

export default HighlighterFullFeatured;
