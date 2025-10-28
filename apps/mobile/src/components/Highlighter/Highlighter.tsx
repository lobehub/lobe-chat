import ActionIcon from '@lobehub/ui-rn/ActionIcon';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';

import Block from '@/components/Block';

import HighlighterFullFeatured from './FullFeatured';
import SyntaxHighlighter from './SyntaxHighlighter';
import { getCodeLanguageByInput } from './const';
import { useStyles } from './style';
import type { HighlighterProps } from './type';

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
    variant = 'filled',
    ...rest
  }) => {
    const { styles, theme } = useStyles();
    const [copied, setCopied] = useState(false);
    const language = lang.toLowerCase();
    const matchedLanguage = getCodeLanguageByInput(language);

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
        <HighlighterFullFeatured
          allowChangeLanguage={allowChangeLanguage}
          code={code}
          copyable={copyable}
          defalutExpand={defalutExpand}
          fileName={fileName}
          lang={matchedLanguage}
          onCopy={onCopy}
          showLanguage={showLanguage}
          style={style}
          variant={variant}
          {...rest}
        />
      );
    }

    return (
      <Block
        pointerEvents={'box-none'}
        style={[styles.container, style]}
        testID="highlighter"
        variant={variant}
        {...rest}
      >
        {copyable && (
          <ActionIcon
            color={copied ? theme.colorSuccess : theme.colorTextDescription}
            icon={copied ? Check : Copy}
            onPress={handleCopy}
            pressEffect
            size={14}
            style={styles.simpleCopyButton}
          />
        )}

        <SyntaxHighlighter language={matchedLanguage}>{code}</SyntaxHighlighter>
      </Block>
    );
  },
);

Highlighter.displayName = 'Highlighter';

export default Highlighter;
