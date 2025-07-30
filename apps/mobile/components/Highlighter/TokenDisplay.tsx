import type { ThemedToken } from '@shikijs/core';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useStyles } from './style';

interface TokenDisplayProps {
  tokens: ThemedToken[][];
  type?: 'default' | 'compact';
}

function generateLineKey(lineIndex: number, lineContent: ThemedToken[]) {
  const lineText = lineContent.map((token) => token.content).join('');
  return `line-${lineIndex}-${lineText}`;
}

function generateTokenKey(lineIndex: number, tokenIndex: number, token: ThemedToken) {
  return `token-${lineIndex}-${tokenIndex}-${token.offset}-${token.content}`;
}

export function TokenDisplay({ tokens, type = 'default' }: TokenDisplayProps) {
  const { styles } = useStyles();

  const containerStyle =
    type === 'compact' ? [styles.codeContainer, styles.codeContainerCompact] : styles.codeContainer;
  const lineStyle =
    type === 'compact' ? [styles.codeLine, styles.codeLineCompact] : styles.codeLine;
  const textStyle =
    type === 'compact' ? [styles.codeText, styles.codeTextCompact] : styles.codeText;

  return (
    <ScrollView style={containerStyle}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.codeScrollContainer}>
          {tokens.map((line, lineIndex) => (
            <View key={generateLineKey(lineIndex, line)} style={lineStyle as any}>
              {line.map((tokenItem, tokenIndex) => (
                <Text
                  key={generateTokenKey(lineIndex, tokenIndex, tokenItem)}
                  style={[
                    {
                      color: tokenItem.color,
                      fontStyle: tokenItem.fontStyle === 1 ? 'italic' : 'normal',
                    },
                    textStyle,
                  ]}
                >
                  {tokenItem.content}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
