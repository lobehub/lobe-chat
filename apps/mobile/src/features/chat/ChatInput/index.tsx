import { ArrowUp } from 'lucide-react-native';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View, ViewStyle } from 'react-native';

import { TextInput, Button } from '@/components';
import { useChat } from '@/hooks/useChat';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import ModelSwitch from './components/ModelSwitch';

import StopLoadingIcon from '../StopLoadingIcon';
import { useStyles } from './style';
import NewChatBtn from './components/NewChatBtn';

interface ChatInputProps {
  style?: ViewStyle;
}

const ChatInput = memo(({ style }: ChatInputProps) => {
  const { t } = useTranslation(['chat']);
  const { input, handleInputChange, handleSubmit, isLoading, canSend, stopGenerating } = useChat();
  useInitAgentConfig(); // 关键：触发agent配置加载
  const { styles } = useStyles();

  const SenderBtn = useMemo(
    () => (
      <Button
        disabled={!canSend}
        icon={isLoading ? <StopLoadingIcon /> : <ArrowUp />}
        onPress={isLoading ? stopGenerating : handleSubmit}
        shape="circle"
        size="large"
        type="primary"
      />
    ),
    [isLoading, stopGenerating, handleSubmit, canSend],
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputArea}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          multiline={true}
          numberOfLines={8}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmit}
          placeholder={t('placeholder', { ns: 'chat' })}
          scrollEnabled={true}
          spellCheck={false}
          style={styles.input}
          textAlignVertical="top"
          textBreakStrategy="highQuality"
          value={input}
          variant="borderless"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <ModelSwitch />
        </View>
        <View style={styles.rightActions}>
          <NewChatBtn />
          {SenderBtn}
        </View>
      </View>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
