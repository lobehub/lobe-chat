import { Flexbox, SendButton, Text } from '@lobehub/ui-rn';
import React from 'react';
import { Alert } from 'react-native';

export default () => {
  return (
    <Flexbox gap={24}>
      <Flexbox gap={8}>
        <Text strong>Small (默认)</Text>
        <SendButton onSend={() => Alert.alert('提示', '小尺寸发送')} size="small" />
      </Flexbox>

      <Flexbox gap={8}>
        <Text strong>Middle</Text>
        <SendButton onSend={() => Alert.alert('提示', '中尺寸发送')} size="middle" />
      </Flexbox>

      <Flexbox gap={8}>
        <Text strong>Large</Text>
        <SendButton onSend={() => Alert.alert('提示', '大尺寸发送')} size="large" />
      </Flexbox>
    </Flexbox>
  );
};
