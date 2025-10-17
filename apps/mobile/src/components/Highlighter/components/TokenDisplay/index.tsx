import type { ThemedToken } from '@shikijs/core';
import { ScrollView, View } from 'react-native';

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

  return error ? (
    <Text code style={styles.errorText}>
      {code}
    </Text>
  ) : (
    <View style={styles.codeContainer}>
      <ScrollView
        contentContainerStyle={styles.horizontalScrollContent}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        <View style={styles.codeScrollContainer}>
          {tokens.map((line, lineIndex) => (
            <View key={generateLineKey(lineIndex, line)} style={styles.codeLine}>
              {line.map((tokenItem, tokenIndex) => (
                <Text
                  code
                  color={tokenItem.color}
                  fontSize={12}
                  italic={tokenItem.fontStyle === 1}
                  key={generateTokenKey(lineIndex, tokenIndex, tokenItem)}
                  style={{
                    backgroundColor: tokenItem.bgColor,
                  }}
                >
                  {tokenItem.content}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
