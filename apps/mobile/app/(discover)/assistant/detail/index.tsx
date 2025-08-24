import { useLocalSearchParams, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BotMessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useSWR from 'swr';

import { AssistantService } from '@/services/assistant';
import { useSessionStore } from '@/store/session';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import DetailHeader from './components/Header';
import SkeletonDetail from './components/SkeletonDetail';
import { Tag, Button, Markdown } from '@/components';
import { useStyles } from './styles';
import { ICON_SIZE } from '@/const/common';
import { DEFAULT_MODEL } from '@/const/settings';

const ASSISTANT_DETAIL_KEY = 'discover-assistant-detail';

const AssistantDetail = () => {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const { styles, token } = useStyles();
  const { t, i18n } = useTranslation(['common', 'discover']);
  const [isAdding, setIsAdding] = useState(false);
  const { addSession } = useSessionStore();

  const {
    data: agent,
    error,
    isLoading,
  } = useSWR(
    [ASSISTANT_DETAIL_KEY, identifier as string, i18n.language],
    async ([, id, language]: [string, string, string]) => {
      const assistantService = new AssistantService();
      const data = await assistantService.getAssistantDetail(id, language);
      return data;
    },
  );

  const handleAddAssistant = () => {
    if (!agent) return;

    setIsAdding(true);
    try {
      // 创建新的会话
      const newSession: LobeAgentSession = {
        createdAt: new Date(),
        id: `agent-${agent.identifier}-${Date.now()}`,
        meta: {
          author: agent.author || 'LobeChat',
          avatar: agent.meta.avatar || '🤖',
          description: agent.meta.description,
          tags: agent.meta.tags || [],
          title: agent.meta.title,
        },
        model: agent.config?.model || DEFAULT_MODEL,
        pinned: false,
        type: LobeSessionType.Agent,
        updatedAt: new Date(),
      };

      // 添加到会话列表
      addSession(newSession);

      // 导航到会话页面
      router.replace({
        params: { id: newSession.id },
        pathname: '/chat',
      });
    } catch (err) {
      console.error(t('assistant.detail.addFailed', { ns: 'discover' }), err);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('assistant.detail.addFailedMessage', { ns: 'discover' }),
      );
    } finally {
      setIsAdding(false);
    }
  };

  // const handleShare = async () => {
  //   if (!agent) return;

  //   try {
  //     await Share.share({
  //       message: `${agent.meta.title} - ${agent.meta.description} #LobeChat`,
  //       url: agent.homepage || `https://chat.lobehub.com`,
  //     });
  //   } catch (error) {
  //     console.error('分享失败:', error);
  //   }
  // };

  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
        <ScrollView style={styles.scrollContainer}>
          <SkeletonDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !agent) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {!identifier
            ? t('assistant.detail.notFoundIdentifier', { ns: 'discover' })
            : t('assistant.detail.loadFailed', { ns: 'discover' })}
        </Text>
      </SafeAreaView>
    );
  }

  // 获取系统角色内容（可能存在于不同的位置）
  const systemRoleContent = agent.config.systemRole;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeAreaContainer}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header with avatar on left, title/author/date on right */}
          <DetailHeader
            author={agent.author || 'LobeChat'}
            avatar={agent.meta.avatar || '🤖'}
            createdAt={agent.createdAt}
            title={agent.meta.title}
          />

          {/* 描述信息 */}
          <Text style={styles.description}>{agent.meta.description}</Text>

          {/* 标签列表 */}
          {agent.meta.tags && agent.meta.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {agent.meta.tags.map((tag: string) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </View>
          )}

          {/* 添加助手与对话按钮 */}
          <View style={styles.actionButtonsContainer}>
            <Button
              block
              disabled={isAdding}
              loading={isAdding}
              onPress={handleAddAssistant}
              size="large"
              type="primary"
            >
              {t('assistant.detail.addAndChat', { ns: 'discover' })}
            </Button>

            {/* <Button 
              type="default" 
              size="large" 
              onPress={handleShare}
            >
              <Share2 size={ICON_SIZE_SMALL} color={token.colorText} />
            </Button> */}
          </View>

          {/* 系统提示区域 */}
          {systemRoleContent && (
            <View style={styles.systemRoleContainer}>
              <View style={styles.settingsTitleContainer}>
                <BotMessageSquare color={token.colorText} size={ICON_SIZE} />
                <Text style={styles.systemRoleTitle}>
                  {t('assistant.detail.assistantSettings', { ns: 'discover' })}
                </Text>
              </View>
              <View style={styles.systemRoleContentContainer}>
                <Markdown fontSize={14}>{systemRoleContent}</Markdown>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssistantDetail;
