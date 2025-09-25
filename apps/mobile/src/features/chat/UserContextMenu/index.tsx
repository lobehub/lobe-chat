import * as Clipboard from 'expo-clipboard';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';

import { useToast } from '@/components';
import { useChatStore } from '@/store/chat';
import { ChatMessage } from '@/types/message';

import { useStyles } from './style';

interface UserContextMenuProps {
  children: React.ReactNode;
  message: ChatMessage;
}

const UserContextMenu: React.FC<UserContextMenuProps> = ({ message, children }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { deleteMessage, regenerateMessage } = useChatStore();
  const toast = useToast();
  const { styles } = useStyles();

  // 复制消息内容
  const handleCopy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      toast.success(t('messageCopied', { ns: 'chat' }));
    } catch (error) {
      console.error('复制失败:', error);
      toast.error(t('copyFailed', { ns: 'chat' }));
    }
  }, [message.content, t, toast]);

  // 重新生成消息
  const handleRegenerate = useCallback(async () => {
    try {
      await regenerateMessage(message.id);
    } catch (error: any) {
      toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
    }
  }, [message.id, regenerateMessage, t, toast]);

  // 删除消息
  const handleDelete = useCallback(() => {
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
  }, [deleteMessage, message.id, t]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <View style={styles.touchableWrapper}>{children}</View>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item key={`${message.id}-copy`} onSelect={handleCopy}>
          <ContextMenu.ItemTitle>{t('actions.copy', { ns: 'common' })}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'doc.on.doc',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item key={`${message.id}-regenerate`} onSelect={handleRegenerate}>
          <ContextMenu.ItemTitle>{t('actions.regenerate', { ns: 'common' })}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'arrow.clockwise',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
        <ContextMenu.Item destructive key={`${message.id}-delete`} onSelect={handleDelete}>
          <ContextMenu.ItemTitle>{t('actions.delete', { ns: 'common' })}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon
            ios={{
              name: 'trash',
              pointSize: 18,
            }}
          />
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
};

export default UserContextMenu;
