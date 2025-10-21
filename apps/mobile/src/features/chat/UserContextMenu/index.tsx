import { ChatMessage } from '@lobechat/types';
import { useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import type { FC, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import Dropdown from '@/components/Dropdown';
import type { DropdownOptionItem } from '@/components/Dropdown';
import { useChatStore } from '@/store/chat';

import { useStyles } from './style';

interface UserContextMenuProps {
  children: ReactNode;
  message: ChatMessage;
}

const UserContextMenu: FC<UserContextMenuProps> = ({ message, children }) => {
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

  const options: DropdownOptionItem[] = useMemo(
    () => [
      {
        icon: { name: 'doc.on.doc', pointSize: 18 },
        key: 'copy',
        onSelect: handleCopy,
        title: t('actions.copy', { ns: 'common' }),
      },
      {
        icon: { name: 'arrow.clockwise', pointSize: 18 },
        key: 'regenerate',
        onSelect: handleRegenerate,
        title: t('actions.regenerate', { ns: 'common' }),
      },
      {
        destructive: true,
        icon: { name: 'trash', pointSize: 18 },
        key: 'delete',
        onSelect: handleDelete,
        title: t('actions.delete', { ns: 'common' }),
      },
    ],
    [handleCopy, handleDelete, handleRegenerate, t],
  );

  return (
    <Dropdown options={options}>
      <View style={styles.touchableWrapper}>{children}</View>
    </Dropdown>
  );
};

export default UserContextMenu;
