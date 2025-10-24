import { ChatMessage } from '@lobechat/types';
import { Block, BlockProps, BottomSheet, Cell, Divider, Flexbox, useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import { Copy, RefreshCw, Trash2 } from 'lucide-react-native';
import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { hapticsEffect } from '@/utils/hapticsEffect';

import { useStyles } from './style';

interface MessageContextMenuProps extends BlockProps {
  children: ReactNode;
  message: ChatMessage;
}

const MessageContextMenu: FC<MessageContextMenuProps> = ({ message, children, ...rest }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { activeId } = useSessionStore();
  const { deleteMessage, regenerateMessage } = useChatStore();
  const toast = useToast();
  const { styles, theme } = useStyles();
  const [open, setOpen] = useState(false);

  const isUser = message.role === 'user';

  // 复制消息内容
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      toast.success(t('messageCopied', { ns: 'chat' }));
      setOpen(false);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error(t('copyFailed', { ns: 'chat' }));
      setOpen(false);
    }
  };

  // 重新生成消息
  const handleRegenerate = async () => {
    try {
      setOpen(false);
      if (isUser) {
        await regenerateMessage(message.id);
      } else {
        await regenerateMessage(activeId);
      }
    } catch (error: any) {
      toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
    }
  };

  // 删除消息
  const handleDelete = () => {
    setOpen(false);
    setTimeout(() => {
      Alert.alert(t('confirmDelete', { ns: 'chat' }), t('deleteMessageConfirm', { ns: 'chat' }), [
        {
          style: 'cancel',
          text: t('cancel', { ns: 'common' }),
        },
        {
          onPress: () => {
            if (isUser) {
              deleteMessage(message.id);
            } else {
              deleteMessage(activeId);
            }
          },
          style: 'destructive',
          text: t('delete', { ns: 'common' }),
        },
      ]);
    }, 300);
  };

  return (
    <>
      <Block
        android_ripple={{
          color: theme.colorFillQuaternary,
          foreground: true,
        }}
        longPressEffect
        onLongPress={(e) => {
          e.stopPropagation();
          setOpen(true);
          hapticsEffect();
        }}
        variant={'borderless'}
        {...rest}
      >
        {children}
      </Block>
      <BottomSheet
        enablePanDownToClose
        onClose={() => setOpen(false)}
        open={open}
        showCloseButton={false}
        snapPoints={['35%']}
      >
        <Flexbox gap={12} padding={16}>
          {/* 复制 */}
          <Block variant={'filled'}>
            <Cell
              icon={Copy}
              iconSize={20}
              onPress={handleCopy}
              paddingBlock={20}
              showArrow={false}
              title={t('actions.copy', { ns: 'common' })}
            />
            <Divider />
            <Cell
              icon={RefreshCw}
              iconSize={20}
              onPress={handleRegenerate}
              paddingBlock={20}
              showArrow={false}
              title={
                isUser
                  ? t('actions.regenerate', { ns: 'common' })
                  : t('actions.retry', { ns: 'common' })
              }
            />
          </Block>

          {/* 删除 */}
          <Block style={styles.actionItemDanger} variant="filled">
            <Cell
              danger
              icon={Trash2}
              iconSize={20}
              onPress={handleDelete}
              paddingBlock={20}
              showArrow={false}
              title={t('actions.delete', { ns: 'common' })}
            />
          </Block>
        </Flexbox>
      </BottomSheet>
    </>
  );
};

export default MessageContextMenu;
