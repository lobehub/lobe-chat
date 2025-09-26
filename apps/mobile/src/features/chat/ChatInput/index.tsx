import { Input, Space } from '@lobehub/ui-rn';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewStyle } from 'react-native';

import SenderBtn from '@/features/chat/actions/SenderBtn';
import ToogleTopic from '@/features/chat/actions/ToogleTopic';
import { useChat } from '@/hooks/useChat';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';

import ModelSwitch from './components/ModelSwitch';
import { useStyles } from './style';

interface ChatInputProps {
  style?: ViewStyle;
}

const ChatInput = memo(({ style }: ChatInputProps) => {
  const { t } = useTranslation(['chat']);
  const { input, handleInputChange, handleSubmit } = useChat();
  useInitAgentConfig(); // 关键：触发agent配置加载
  const { styles } = useStyles();

  return (
    <View style={[styles.container, style]}>
      <Input.TextArea
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        numberOfLines={8}
        onChangeText={handleInputChange}
        onSubmitEditing={handleSubmit}
        placeholder={t('placeholder', { ns: 'chat' })}
        scrollEnabled={true}
        spellCheck={false}
        style={styles.input}
        textBreakStrategy="highQuality"
        value={input}
        variant="borderless"
      />
      <View style={styles.footer}>
        <Space>
          <ModelSwitch />
        </Space>
        <Space>
          <ToogleTopic />
          <SenderBtn />
        </Space>
      </View>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
