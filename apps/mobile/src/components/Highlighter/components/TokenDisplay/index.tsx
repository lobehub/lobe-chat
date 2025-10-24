import type { ThemedToken } from '@shikijs/core';
import { FlashList } from '@shopify/flash-list';

import Text from '@/components/Text';
import { useThemeMode } from '@/components/styles';

import { useTokenize } from '../../hooks/useTokenize';
import { useStyles } from './style';

interface TokenDisplayProps {
  code: string;
  lang: string;
}

function generateLineKey(lineIndex: number, lineContent: ThemedToken[]) {
  const lineText = lineContent.map((token) => token.content).join('');
  return `line-${lineIndex}-${lineText}`;
}

function generateTokenKey(lineIndex: number, tokenIndex: number, token: ThemedToken) {
  return `token-${lineIndex}-${tokenIndex}-${token.offset}-${token.content}`;
}

export function TokenDisplay({ code, lang }: TokenDisplayProps) {
  const { isDarkMode } = useThemeMode();
  const { tokens, error } = useTokenize(code, lang, isDarkMode ? 'dark' : 'light');
  const { styles } = useStyles();

  const renderLine = ({ item: line, index: lineIndex }: { index: number; item: ThemedToken[] }) => (
    <Text code key={lineIndex}>
      {line.map((tokenItem, tokenIndex) => (
        <Text
          code
          color={tokenItem.color}
          fontSize={12}
          italic={tokenItem.fontStyle === 1}
          key={generateTokenKey(lineIndex, tokenIndex, tokenItem)}
          style={{
            backgroundColor: tokenItem.bgColor,
            lineHeight: 20,
          }}
        >
          {tokenItem.content}
        </Text>
      ))}
    </Text>
  );

  return error ? (
    <Text code fontSize={12} style={styles.errorText}>
      {code}
    </Text>
  ) : (
    <FlashList
      contentContainerStyle={{
        flex: 1,
        padding: 16,
      }}
      data={tokens}
      keyExtractor={(line, lineIndex) => generateLineKey(lineIndex, line)}
      nestedScrollEnabled={true}
      renderItem={renderLine}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    />
  );
}
