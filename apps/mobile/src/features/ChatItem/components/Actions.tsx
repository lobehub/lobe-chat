import { UIChatMessage } from '@lobechat/types';
import { ActionIcon, Flexbox, useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Check, Copy, EditIcon, RefreshCw, Trash2 } from 'lucide-react-native';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleProp, ViewStyle } from 'react-native';
import { GestureResponderEvent } from 'react-native/Libraries/Types/CoreEventTypes';

import { useTheme } from '@/components/styles';
import { loading } from '@/libs/loading';
import { useChatStore } from '@/store/chat';

interface ActionsProps {
  hasError?: boolean;
  message: UIChatMessage;
  style?: StyleProp<ViewStyle>;
}

const Actions = memo<ActionsProps>(({ message, hasError = false, style }) => {
  const { t } = useTranslation(['chat', 'common']);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const toast = useToast();
  const token = useTheme();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 编辑消息
  const handleEdit = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      router.push({
        params: { messageId: message.id },
        pathname: '/(main)/chat/message/edit',
      });
    },
    [message.id],
  );

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
          onPress: async () => {
            await loading.start(
              (async () => {
                await deleteMessage(message.id);
              })(),
            );
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

  // Error 情况下只显示 regenerate 和 delete
  if (hasError) {
    return (
      <Flexbox gap={4} horizontal style={style}>
        <ActionIcon
          color={token.colorTextDescription}
          icon={RefreshCw}
          onPress={handleRegenerate}
          size={16}
        />
        <ActionIcon
          color={token.colorTextDescription}
          icon={Trash2}
          onPress={handleDelete}
          size={16}
        />
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={4} horizontal style={style}>
      <ActionIcon
        color={isCopied ? token.colorSuccess : token.colorTextDescription}
        disabled={isCopied}
        icon={isCopied ? Check : Copy}
        onPress={handleCopy}
        size={16}
      />
      <ActionIcon
        color={token.colorTextDescription}
        icon={EditIcon}
        onPress={handleEdit}
        size={16}
      />
      <ActionIcon
        color={token.colorTextDescription}
        icon={RefreshCw}
        onPress={handleRegenerate}
        size={16}
      />
      <ActionIcon
        color={token.colorTextDescription}
        icon={Trash2}
        onPress={handleDelete}
        size={16}
      />
    </Flexbox>
  );
});

Actions.displayName = 'MessageActions';

export default Actions;
