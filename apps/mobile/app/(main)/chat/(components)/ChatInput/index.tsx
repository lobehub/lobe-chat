import { ArrowUp } from 'lucide-react-native';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconBtn from './(components)/IconBtn';
import { ICON_SIZE } from '@/const/common';
import { useChat } from '@/hooks/useChat';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useThemeToken } from '@/theme';
import ModelSwitch from './(components)/ModelSwitch';

import StopLoadingIcon from '../StopLoadingIcon';
import { useStyles } from './style';
import NewChatBtn from './(components)/NewChatBtn';

const PADDING_SIZE = 16;

interface ChatInputProps {
  style?: ViewStyle;
}

const ChatInput = memo(({ style }: ChatInputProps) => {
  const { t } = useTranslation(['chat']);
  const { input, handleInputChange, handleSubmit, isLoading, canSend, stopGenerating } = useChat();
  useInitAgentConfig(); // 关键：触发agent配置加载
  const insets = useSafeAreaInsets();
  const token = useThemeToken();
  const { styles } = useStyles();

  const senderIconColor = token.colorText;

  const SenderBtn = useMemo(
    () => () =>
      isLoading ? (
        <IconBtn
          icon={<StopLoadingIcon color={senderIconColor} size={ICON_SIZE + PADDING_SIZE} />}
          onPress={stopGenerating}
          variant="primary"
        />
      ) : (
        <IconBtn
          disabled={!canSend}
          icon={<ArrowUp color={senderIconColor} size={ICON_SIZE} />}
          onPress={handleSubmit}
          style={{ opacity: canSend ? 1 : 0.5 }}
          variant="primary"
        />
      ),
    [isLoading, stopGenerating, handleSubmit, canSend, senderIconColor],
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }, style]}>
      <View style={styles.inputArea}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          multiline={true}
          numberOfLines={4}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSubmit}
          placeholder={t('placeholder', { ns: 'chat' })}
          placeholderTextColor={token.colorTextPlaceholder}
          scrollEnabled={true}
          spellCheck={false}
          style={styles.input}
          textAlignVertical="top"
          textBreakStrategy="highQuality"
          value={input}
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.leftActions}>
          <NewChatBtn />
          <ModelSwitch />
        </View>
        <View style={styles.rightActions}>
          <SenderBtn />
        </View>
      </View>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
