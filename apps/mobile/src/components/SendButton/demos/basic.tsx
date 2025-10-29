import { Flexbox, SendButton, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';
import { Alert } from 'react-native';

export default () => {
  const [generating, setGenerating] = useState(false);

  return (
    <Flexbox gap={16}>
      <Text strong>发送按钮</Text>
      <SendButton onSend={() => Alert.alert('提示', '发送消息')} />

      <Text strong>loading</Text>
      <SendButton loading onStop={() => Alert.alert('提示', '停止生成')} />

      <Text strong>停止按钮（生成中）</Text>
      <SendButton generating onStop={() => Alert.alert('提示', '停止生成')} />

      <Text strong>交互示例</Text>
      <Flexbox align="center" gap={12} horizontal>
        <SendButton
          generating={generating}
          onSend={() => {
            setGenerating(true);
            setTimeout(() => setGenerating(false), 3000);
          }}
          onStop={() => setGenerating(false)}
        />
        <Text type="secondary">{generating ? '正在生成...' : '准备发送'}</Text>
      </Flexbox>

      <Flexbox gap={12} horizontal>
        <SendButton disabled onSend={() => {}} />
        <Text type="secondary">禁用发送按钮</Text>
      </Flexbox>
    </Flexbox>
  );
};
