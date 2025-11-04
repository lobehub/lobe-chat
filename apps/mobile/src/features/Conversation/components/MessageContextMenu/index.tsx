import { UIChatMessage } from '@lobechat/types';
import { Block, BlockProps, BottomSheet, Cell, Divider, Flexbox, useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Copy, Edit3, RefreshCw, Trash2 } from 'lucide-react-native';
import type { FC, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { hapticsEffect } from '@/utils/hapticsEffect';

import { useStyles } from './style';

interface MessageContextMenuProps extends BlockProps {
  children: ReactNode;
  message: UIChatMessage;
}

const MessageContextMenu: FC<MessageContextMenuProps> = ({ message, children, ...rest }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { activeId } = useSessionStore();
  const { deleteMessage, regenerateMessage } = useChatStore();
  const toast = useToast();
  const { styles, theme } = useStyles();
  const [open, setOpen] = useState(false);
  const longPressTimerRef = useRef<any>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

  // 编辑消息
  const handleEdit = () => {
    setOpen(false);
    // 导航到编辑页面，通过 URL params 传递消息 ID
    router.push({
      params: { messageId: message.id },
      pathname: '/(main)/chat/message/edit',
    });
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

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  };

  return (
    <>
      <View
        onTouchCancel={clearLongPressTimer}
        onTouchEnd={clearLongPressTimer}
        onTouchMove={(e) => {
          // 检查移动距离，超过10px就取消长按
          const touch = e.nativeEvent.touches[0];
          if (touchStartRef.current && touch) {
            const dx = Math.abs(touch.pageX - touchStartRef.current.x);
            const dy = Math.abs(touch.pageY - touchStartRef.current.y);
            if (dx > 10 || dy > 10) {
              clearLongPressTimer();
            }
          }
        }}
        onTouchStart={(e) => {
          // 记录初始触摸位置
          const touch = e.nativeEvent.touches[0];
          if (touch) {
            touchStartRef.current = { x: touch.pageX, y: touch.pageY };
          }
          // 开始触摸时启动长按计时器
          longPressTimerRef.current = setTimeout(() => {
            setOpen(true);
            hapticsEffect();
          }, 500);
        }}
      >
        <Block variant={'borderless'} {...rest}>
          {children}
        </Block>
      </View>
      <BottomSheet
        enablePanDownToClose
        onClose={() => setOpen(false)}
        open={open}
        showCloseButton={false}
        snapPoints={['40%']}
      >
        <Flexbox gap={12} padding={16}>
          {/* 复制、编辑、重新生成 */}
          <Block variant={'filled'}>
            <Cell
              icon={Copy}
              iconSize={20}
              onPress={handleCopy}
              paddingBlock={20}
              showArrow={false}
              title={t('actions.copy', { ns: 'common' })}
            />
            <Divider style={{ backgroundColor: theme.colorFillSecondary }} />
            <Cell
              icon={Edit3}
              iconSize={20}
              onPress={handleEdit}
              paddingBlock={20}
              showArrow={false}
              title={t('actions.edit', { ns: 'common' })}
            />
            <Divider style={{ backgroundColor: theme.colorFillSecondary }} />
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
