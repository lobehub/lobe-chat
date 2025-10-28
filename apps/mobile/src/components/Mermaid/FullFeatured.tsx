import * as Clipboard from 'expo-clipboard';
import { Check, ChevronDown, ChevronRight, Copy } from 'lucide-react-native';
import { memo, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import ActionIcon from '@/components/ActionIcon';
import Block from '@/components/Block';
import Flexbox from '@/components/Flexbox';
import Text from '@/components/Text';

import SyntaxMermaid from './SyntaxMermaid';
import { useStyles } from './style';
import type { MermaidProps } from './type';

interface MermaidFullFeaturedProps extends MermaidProps {
  code: string;
  copyable?: boolean;
  defalutExpand?: boolean;
  fileName?: string;
  onCopy?: (code: string) => void;
  showLanguage?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MermaidFullFeatured = memo<MermaidFullFeaturedProps>(
  ({
    code,
    copyable = true,
    showLanguage = true,
    fileName,
    defalutExpand = true,
    style,
    onCopy,
    variant,
    ...rest
  }) => {
    const [expanded, setExpanded] = useState(defalutExpand);
    const { styles, theme } = useStyles();
    const [copied, setCopied] = useState(false);
    const language = 'mermaid';

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
          <Flexbox align={'center'} horizontal justify={'flex-start'}>
            <ActionIcon
              color={theme.colorTextDescription}
              icon={expanded ? ChevronDown : ChevronRight}
              onPress={() => setExpanded(!expanded)}
              size={14}
            />
          </Flexbox>

          {(showLanguage || fileName) && (
            <Text code color={theme.colorTextSecondary} fontSize={12}>
              {fileName || language}
            </Text>
          )}

          <Flexbox align={'center'} horizontal justify={'flex-end'}>
            {copyable && (
              <ActionIcon
                color={copied ? theme.colorSuccess : theme.colorTextDescription}
                icon={copied ? Check : Copy}
                onPress={handleCopy}
                size={14}
              />
            )}
          </Flexbox>
        </Flexbox>
        {expanded && <SyntaxMermaid>{code}</SyntaxMermaid>}
      </Block>
    );
  },
);

MermaidFullFeatured.displayName = 'MermaidFullFeatured';

export default MermaidFullFeatured;
