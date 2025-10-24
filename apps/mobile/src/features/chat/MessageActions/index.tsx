import { ChatMessage } from '@lobechat/types';
import { ActionIcon, Flexbox, useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleProp, ViewStyle } from 'react-native';
import { GestureResponderEvent } from 'react-native/Libraries/Types/CoreEventTypes';

import { useTheme } from '@/components/styles';
import { useChatStore } from '@/store/chat';

interface MessageActionsProps {
  message: ChatMessage;
  style?: StyleProp<ViewStyle>;
}

const MessageActions = memo<MessageActionsProps>(({ message, style }) => {
  const { t } = useTranslation(['chat', 'common']);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const toast = useToast();
  const token = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 复制消息内容
  const handleCopy = useCallback(
    async (event: GestureResponderEvent) => {
      event.stopPropagation();
      try {
        await Clipboard.setStringAsync(message.content);
        setIsCopied(true);
        toast.success(t('messageCopied', { ns: 'chat' }));

        // 2秒后恢复原始图标
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        console.error('复制失败:', error);
        toast.error(t('copyFailed', { ns: 'chat' }));
      }
    },
    [message.content],
  );

  // 重新生成消息
  const handleRegenerate = useCallback(
    async (event: GestureResponderEvent) => {
      event.stopPropagation();
      try {
        await regenerateMessage(message.id);
      } catch (error: any) {
        toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
      }
    },
    [message.id, regenerateMessage],
  );

  // 删除消息
  const handleDelete = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      Alert.alert(t('confirmDelete', { ns: 'chat' }), t('deleteMessageConfirm', { ns: 'chat' }), [
        {
          style: 'cancel',
          text: t('cancel', { ns: 'common' }),
        },
        {
          onPress: () => {
            deleteMessage(message.id);
          },
          style: 'destructive',
          text: t('delete', { ns: 'common' }),
        },
      ]);
    },
    [deleteMessage, message.id],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Flexbox gap={4} horizontal style={style}>
      <ActionIcon
        color={isCopied ? token.colorSuccess : token.colorTextDescription}
        disabled={isCopied}
        icon={isCopied ? Check : Copy}
        onPress={handleCopy}
        size={'small'}
      />
      <ActionIcon
        color={token.colorTextDescription}
        icon={RefreshCw}
        onPress={handleRegenerate}
        size={'small'}
      />
      <ActionIcon
        color={token.colorTextDescription}
        icon={Trash2}
        onPress={handleDelete}
        size="small"
      />
    </Flexbox>
  );
});

MessageActions.displayName = 'MessageActions';

export default MessageActions;
