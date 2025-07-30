import * as Clipboard from 'expo-clipboard';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TouchableOpacity, View } from 'react-native';

import { useToast } from '@/components';
import { ICON_SIZE_TINY } from '@/const/common';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useThemeToken } from '@/theme';
import { ChatMessage } from '@/types/message';

import { useStyles } from './style';

interface MessageActionsProps {
  message: ChatMessage;
}

const MessageActions: React.FC<MessageActionsProps> = ({ message }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { activeId } = useSessionStore();
  const { deleteMessage, regenerateMessage } = useChatStore();
  const toast = useToast();
  const token = useThemeToken();
  const { styles } = useStyles();
  const [isCopied, setIsCopied] = React.useState(false);

  // 复制消息内容
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      setIsCopied(true);
      toast.success(t('messageCopied', { ns: 'chat' }));

      // 2秒后恢复原始图标
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error(t('copyFailed', { ns: 'chat' }));
    }
  };

  // 重新生成消息
  const handleRegenerate = async () => {
    try {
      await regenerateMessage(activeId, message.id);
    } catch (error: any) {
      toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
    }
  };

  // 删除消息
  const handleDelete = () => {
    Alert.alert(t('confirmDelete', { ns: 'chat' }), t('deleteMessageConfirm', { ns: 'chat' }), [
      {
        style: 'cancel',
        text: t('cancel', { ns: 'common' }),
      },
      {
        onPress: () => {
          deleteMessage(activeId, message.id);
        },
        style: 'destructive',
        text: t('delete', { ns: 'common' }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isCopied}
        onPress={handleCopy}
        style={styles.actionButton}
      >
        {isCopied ? (
          <Check color={token.colorSuccess} size={ICON_SIZE_TINY} />
        ) : (
          <Copy color={token.colorIcon} size={ICON_SIZE_TINY} />
        )}
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={handleRegenerate} style={styles.actionButton}>
        <RefreshCw color={token.colorIcon} size={ICON_SIZE_TINY} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.actionButton}>
        <Trash2 color={token.colorIcon} size={ICON_SIZE_TINY} />
      </TouchableOpacity>
    </View>
  );
};

export default MessageActions;
