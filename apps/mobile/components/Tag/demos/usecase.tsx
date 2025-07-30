import React from 'react';
import { View, Text } from 'react-native';
import { useThemeToken } from '@/mobile/theme';
import Tag from '../index';

const UseCaseDemo = () => {
  const token = useThemeToken();

  return (
    <View style={{ padding: 16 }}>
      <View
        style={{
          backgroundColor: token.colorFillQuaternary,
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: token.colorText,
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          AI Assistant Card
        </Text>
        <Text
          style={{
            color: token.colorTextSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginBottom: 12,
          }}
        >
          A powerful AI assistant that can help you with various tasks including coding, writing,
          and problem-solving.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Tag>AI</Tag>
          <Tag>Chat</Tag>
          <Tag>Assistant</Tag>
          <Tag>Coding</Tag>
          <Tag>Writing</Tag>
          <Tag>Problem Solving</Tag>
        </View>
      </View>
    </View>
  );
};

export default UseCaseDemo;
