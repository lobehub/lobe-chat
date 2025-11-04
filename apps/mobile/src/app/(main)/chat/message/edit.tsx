import { Button, PageContainer, TextArea } from '@lobehub/ui-rn';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loading } from '@/libs/loading';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

export default function MessageEditScreen() {
  const { t } = useTranslation(['chat', 'common']);
  const { messageId } = useLocalSearchParams<{ messageId: string }>();
  const insets = useSafeAreaInsets();
  const message = useChatStore((s) => chatSelectors.getMessageById(messageId)(s));
  const modifyMessageContent = useChatStore((s) => s.modifyMessageContent);

  const [editValue, setEditValue] = useState(message?.content || '');

  const textInputRef = useRef<TextInput>(null);

  const handleSave = useCallback(async () => {
    // 如果内容没有变化，直接返回
    if (editValue === message?.content) {
      router.back();
      return;
    }

    // 内容不能为空
    if (!editValue.trim()) {
      return;
    }

    try {
      await loading.start(modifyMessageContent(messageId, editValue));
      router.back();
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  }, [editValue, message?.content, messageId, modifyMessageContent]);

  // 监听 message 变化，同步更新编辑值
  useEffect(() => {
    if (message?.content) {
      setEditValue(message.content);
    }
  }, [message?.content]);

  return (
    <PageContainer
      extra={
        <Button onPress={handleSave} size={'small'} type={'primary'}>
          {t('setting.done', { ns: 'chat' })}
        </Button>
      }
      safeAreaProps={{
        edges: ['top'],
      }}
      showBack
      title={t('messageEdit.title', { ns: 'chat' })}
    >
      <KeyboardAwareScrollView
        bottomOffset={16}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        <TextArea
          autoFocus
          onChangeText={setEditValue}
          placeholder={t('messageEdit.placeholder', { ns: 'chat' })}
          ref={textInputRef}
          style={{ flex: 1, minHeight: 200, paddingBottom: insets.bottom }}
          value={editValue}
          variant={'borderless'}
        />
      </KeyboardAwareScrollView>
    </PageContainer>
  );
}
