import { Span } from '@expo/html-elements';
import type { ThemedToken } from '@shikijs/core';
import { memo } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useHighlight } from '@/components/hooks/useHighlight';

import Text from '../../Text';

interface SyntaxHighlighterProps {
  children: string;
  language: string;
}

function generateTokenKey(lineIndex: number, tokenIndex: number, token: ThemedToken) {
  return `token-${lineIndex}-${tokenIndex}-${token.offset}-${token.content}`;
}

const SyntaxHighlighter = memo<SyntaxHighlighterProps>(({ children, language }) => {
  const {
    data: tokens,
    error,
    isLoading,
  } = useHighlight(children, {
    language,
  });

  if (isLoading || error || !tokens || !tokens.map) {
    return (
      <View style={{ padding: 16 }}>
        <Text code fontSize={12}>
          {children}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}
      decelerationRate="fast"
      directionalLockEnabled={false}
      horizontal
      nestedScrollEnabled
      removeClippedSubviews={false}
      scrollEnabled
      showsHorizontalScrollIndicator={false}
    >
      <View>
        {tokens.map((line, lineIndex) => (
          <Span key={`line-${lineIndex}`} style={{ display: 'flex', flexDirection: 'row' }}>
            {line.map((tokenItem, tokenIndex) => (
              <Text
                code
                fontSize={12}
                key={generateTokenKey(lineIndex, tokenIndex, tokenItem)}
                style={{
                  backgroundColor: tokenItem.bgColor,
                  color: tokenItem.color,
                  fontStyle: tokenItem.fontStyle === 1 ? 'italic' : 'normal',
                }}
              >
                {tokenItem.content}
              </Text>
            ))}
          </Span>
        ))}
      </View>
    </ScrollView>
  );
});

SyntaxHighlighter.displayName = 'SyntaxHighlighter';

export default SyntaxHighlighter;
