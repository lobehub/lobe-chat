import * as Clipboard from 'expo-clipboard';
import { Copy, LucideIcon, RefreshCw, Trash2 } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { useToast, Tooltip } from '@/mobile/components';
import { useChatStore } from '@/mobile/store/chat';
import { useSessionStore } from '@/mobile/store/session';
import { useThemeToken } from '@/mobile/theme';
import { ChatMessage } from '@/mobile/types/message';

import { useStyles } from './style';

interface ToolTipActionsProps {
  children: React.ReactNode;
  message: ChatMessage;
}

const ToolTipActions: React.FC<ToolTipActionsProps> = ({ message, children }) => {
  const { t } = useTranslation(['chat', 'common']);
  const { activeId } = useSessionStore();
  const { deleteMessage, regenerateMessage } = useChatStore();
  const toast = useToast();
  const token = useThemeToken();
  const { styles } = useStyles();
  const [tooltipVisible, setTooltipVisible] = React.useState(false);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // 复制消息内容
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.content);
      toast.success(t('messageCopied', { ns: 'chat' }));
      setTooltipVisible(false); // 关闭tooltip
    } catch (error) {
      console.error('复制失败:', error);
      toast.error(t('copyFailed', { ns: 'chat' }));
      setTooltipVisible(false); // 关闭tooltip
    }
  };

  // 重新生成消息
  const handleRegenerate = async () => {
    try {
      await regenerateMessage(activeId, message.id);
      setTooltipVisible(false); // 关闭tooltip
    } catch (error: any) {
      toast.error(error.message || t('regenerateFailed', { ns: 'chat' }));
      setTooltipVisible(false); // 关闭tooltip
    }
  };

  // 删除消息
  const handleDelete = () => {
    setTooltipVisible(false); // 先关闭tooltip
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

  // 渲染单个操作项
  const renderActionItem = (Icon: LucideIcon, label: string, onPress: () => void) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.actionItem}>
      <Icon color={token.colorBgContainer} size={20} />
      <Text style={[styles.actionLabel]}>{label}</Text>
    </TouchableOpacity>
  );

  // 渲染操作网格
  const renderActions = () => {
    if (isAssistant) {
      // AI消息操作：复制、重新生成、删除
      return (
        <View style={styles.actionsContainer}>
          <View style={styles.actionsRow}>
            {renderActionItem(Copy, t('actions.copy', { ns: 'common' }), handleCopy)}
            {renderActionItem(RefreshCw, t('actions.retry', { ns: 'common' }), handleRegenerate)}
            {renderActionItem(Trash2, t('actions.delete', { ns: 'common' }), handleDelete)}
          </View>
        </View>
      );
    } else {
      // 用户消息操作：复制、删除
      return (
        <View style={styles.actionsContainer}>
          <View style={styles.actionsRow}>
            {renderActionItem(Copy, t('actions.copy', { ns: 'common' }), handleCopy)}
            {renderActionItem(Trash2, t('actions.delete', { ns: 'common' }), handleDelete)}
          </View>
        </View>
      );
    }
  };

  return (
    <Tooltip
      arrow={true}
      onVisibleChange={setTooltipVisible}
      overlayStyle={styles.tooltipOverlay}
      placement={isUser ? 'topRight' : 'topLeft'}
      title={renderActions()}
      trigger="longPress"
      visible={tooltipVisible}
    >
      <TouchableOpacity activeOpacity={1} style={styles.touchableWrapper}>
        {children}
      </TouchableOpacity>
    </Tooltip>
  );
};

export default ToolTipActions;
