import {
  Avatar,
  Button,
  Center,
  Divider,
  Empty,
  Flexbox,
  Markdown,
  PageContainer,
  Text,
} from '@lobehub/ui-rn';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager, ScrollView } from 'react-native';

import ChatBubble from '@/features/chat/ChatBubble';
import SkeletonDetail from '@/features/discover/assistant/components/SkeletonDetail';
import { useDiscoverStore } from '@/store/discover';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { useAuth } from '@/store/user';

const AssistantDetail = () => {
  const { slugs } = useLocalSearchParams<{ slugs: string[] }>();
  const identifier = decodeURIComponent(slugs.join('/'));
  const { user } = useAuth();
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
      const session = await createSession(
        {
          config,
          meta,
        },
        false,
      );
      toggleDrawer();
      InteractionManager.runAfterInteractions(() => {
        // 导航到会话页面
        router.replace({
          params: { session: session },
          pathname: '/chat',
        });
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

  let content;

  if (isLoading) {
    content = <SkeletonDetail />;
  } else if (error || !agent) {
    content = (
      <Empty
        description={
          !identifier
            ? t('assistant.detail.notFoundIdentifier', { ns: 'discover' })
            : t('assistant.detail.loadFailed', { ns: 'discover' })
        }
      />
    );
  } else {
    content = (
      <>
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <Flexbox gap={16} padding={16}>
            <Center>
              <Avatar alt={agent.title} avatar={agent.avatar || '🤖'} size={100} />
            </Center>
            {agent.config.openingMessage && <Markdown>{agent.config.openingMessage}</Markdown>}
          </Flexbox>
          <Divider />
          <Flexbox paddingBlock={16}>
            {agent.examples?.map((item, index) => (
              <ChatBubble
                key={index}
                message={
                  {
                    ...item,
                    meta:
                      item.role === 'user'
                        ? {
                            avatar: user?.avatar,
                            title: user?.name || user?.username || 'User',
                          }
                        : {
                            avatar: agent.avatar,
                            title: agent.title || 'Assistant',
                          },
                  } as any
                }
                showActions={false}
                showTime={false}
                showTitle
              />
            ))}
          </Flexbox>
        </ScrollView>
        <Flexbox padding={16}>
          <Button
            block
            disabled={isAdding}
            loading={isAdding}
            onPress={handleAddAssistant}
            type="primary"
          >
            {t('assistant.detail.addAndChat', { ns: 'discover' })}
          </Button>
        </Flexbox>
      </>
    );
  }

  return (
    <PageContainer
      showBack
      title={
        agent?.title ? (
          <Flexbox align={'center'} gap={3} justify={'center'}>
            <Text align={'center'} ellipsis strong>
              {agent.title}
            </Text>
            <Text align={'center'} ellipsis fontSize={12} type={'secondary'}>
              @{agent.author}
            </Text>
          </Flexbox>
        ) : (
          t('assistant.detail.title', { ns: 'discover' })
        )
      }
    >
      {content}
    </PageContainer>
  );
};

export default AssistantDetail;
