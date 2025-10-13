import { ChatMessage } from '@lobechat/types';
import { Icon, useToast } from '@lobehub/ui-rn';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useTheme } from '@/components/theme';
import { useChatStore } from '@/store/chat';

import { useStyles } from './style';

interface MessageActionsProps {
  message: ChatMessage;
  style?: StyleProp<ViewStyle>;
}

const MessageActionsComponent = ({ message, style }: MessageActionsProps) => {
  const { t } = useTranslation(['chat', 'common']);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const regenerateMessage = useChatStore((s) => s.regenerateMessage);
  const toast = useToast();
  const token = useTheme();
  const { styles } = useStyles();
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 复制消息内容
  const handleCopy = useCallback(async () => {
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
  }, [message.content]);

  // 重新生成消息
  const handleRegenerate = useCallback(async () => {
    try {
      await regenerateMessage(message.id);
    } catch (error: any) {
      toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
    }
  }, [message.id, regenerateMessage]);

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
  }, [deleteMessage, message.id]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isCopied}
        onPress={handleCopy}
        style={styles.actionButton}
      >
        {isCopied ? (
          <Icon color={token.colorSuccess} icon={Check} size="small" />
        ) : (
          <Icon color={token.colorIcon} icon={Copy} size="small" />
        )}
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={handleRegenerate} style={styles.actionButton}>
        <Icon color={token.colorIcon} icon={RefreshCw} size="small" />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.actionButton}>
        <Icon color={token.colorIcon} icon={Trash2} size="small" />
      </TouchableOpacity>
    </View>
  );
};

const MessageActions = memo(MessageActionsComponent);
MessageActions.displayName = 'MessageActions';

export default MessageActions;
