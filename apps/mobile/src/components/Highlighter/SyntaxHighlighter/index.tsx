import { Span } from '@expo/html-elements';
import type { ThemedToken } from '@shikijs/core';
import { memo } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { useHighlight } from '@/components/hooks/useHighlight';

import Text from '../../Text';
import { isSupportedLanguage } from '../const';

interface SyntaxHighlighterProps {
  children: string;
  language: string;
}

function generateTokenKey(lineIndex: number, tokenIndex: number, token: ThemedToken) {
  return `token-${lineIndex}-${tokenIndex}-${token.offset}-${token.content}`;
}

const CodeLine = memo<ThemedToken>(
  ({ bgColor, color, fontStyle, content }) => {
    return (
      <Text
        code
        fontSize={12}
        style={{
          backgroundColor: bgColor,
          color: color,
          fontStyle: fontStyle === 1 ? 'italic' : 'normal',
          lineHeight: 18,
        }}
      >
        {content}
      </Text>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content,
);

const CodeRow = memo<{ line: ThemedToken[]; lineIndex: number }>(
  ({ line, lineIndex }) => {
    return (
      <Span>
        {line.map((tokenItem, tokenIndex) => (
          <CodeLine key={generateTokenKey(lineIndex, tokenIndex, tokenItem)} {...tokenItem} />
        ))}
      </Span>
    );
  },
  (prevProps, nextProps) => prevProps.line === nextProps.line,
);

const SyntaxHighlighter = memo<SyntaxHighlighterProps>(({ children, language }) => {
  const { data: tokens = [] } = useHighlight(children, {
    language,
  });

  let content;

  if (!isSupportedLanguage(language)) {
    content = (
      <Text code fontSize={12}>
        {children}
      </Text>
    );
  } else {
    content = tokens.map((line, lineIndex) => (
      <CodeRow key={`line-${lineIndex}`} line={line} lineIndex={lineIndex} />
    ));
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
      <View>{content}</View>
    </ScrollView>
  );
});

SyntaxHighlighter.displayName = 'SyntaxHighlighter';

export default SyntaxHighlighter;
