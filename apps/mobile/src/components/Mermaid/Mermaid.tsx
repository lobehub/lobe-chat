import ActionIcon from '@lobehub/ui-rn/ActionIcon';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';

import Block from '@/components/Block';

import MermaidFullFeatured from './FullFeatured';
import SyntaxMermaid from './SyntaxMermaid';
import { useStyles } from './style';
import type { MermaidProps } from './type';

const Mermaid = memo<MermaidProps>(
  ({
    code,
    fullFeatured = false,
    copyable = true,
    showLanguage = true,
    fileName,
    defalutExpand = true,
    style,
    onCopy,
    variant = 'filled',
    ...rest
  }) => {
    const { styles, theme } = useStyles();
    const [copied, setCopied] = useState(false);

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
        <MermaidFullFeatured
          code={code}
          copyable={copyable}
          defalutExpand={defalutExpand}
          fileName={fileName}
          onCopy={onCopy}
          showLanguage={showLanguage}
          style={style}
          variant={variant}
          {...rest}
        />
      );
    }

    return (
      <Block style={[styles.container, style]} testID="highlighter" variant={variant} {...rest}>
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
        <SyntaxMermaid>{code}</SyntaxMermaid>
      </Block>
    );
  },
);

Mermaid.displayName = 'Mermaid';

export default Mermaid;
