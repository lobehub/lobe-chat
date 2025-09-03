import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BotMessageSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DetailHeader from './components/Header';
import SkeletonDetail from './components/SkeletonDetail';
import { Tag, Button, Markdown, Header } from '@/components';
import { useStyles } from './styles';
import { ICON_SIZE } from '@/const/common';
import { useDiscoverStore } from '@/store/discover';
import { useSessionStore } from '@/store/session';
import { useGlobalStore } from '@/store/global';

const AssistantDetail = () => {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const { styles, token } = useStyles();
  const { t } = useTranslation(['common', 'discover']);
  const [isAdding, setIsAdding] = useState(false);
  const createSession = useSessionStore((s) => s.createSession);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const useAssistantDetail = useDiscoverStore((s) => s.useAssistantDetail);
  const {
    data: agent,
    error,
    isLoading,
  } = useAssistantDetail({
    identifier: identifier as string,
  });

  // const handleAddAgentAndConverse = async () => {
  //   if (!config) return;
  //
  //   setIsLoading(true);
  //   const session = await createSession({
  //     config,
  //     meta,
  //   });
  //   setIsLoading(false);
  //   message.success(t('assistants.addAgentSuccess'));
  //   router.push(SESSION_CHAT_URL(session, mobile));
  // };

  const handleAddAssistant = async () => {
    if (!agent?.config) return;

    const { config } = agent;
    const meta = {
      avatar: agent.avatar,
      backgroundColor: agent.backgroundColor,
      description: agent.description,
      tags: agent.tags,
      title: agent.title,
    };

    setIsAdding(true);
    try {
      // 添加到会话列表
      const session = await createSession({
        config,
        meta,
      });
      toggleDrawer();
      // 导航到会话页面
      router.replace({
        params: { session: session },
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
  //
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
        <Header showBack />
        <ScrollView style={styles.scrollContainer}>
          <SkeletonDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !agent) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Header showBack />
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
      <Header showBack title={agent.title} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Header with avatar on left, title/author/date on right */}
          <DetailHeader
            author={agent.author || 'LobeChat'}
            avatar={agent.avatar || '🤖'}
            createdAt={agent.createdAt}
            title={agent.title}
          />

          {/* 描述信息 */}
          <Text style={styles.description}>{agent.description}</Text>

          {/* 标签列表 */}
          {agent.tags && agent.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {agent.tags.map((tag: string) => (
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
