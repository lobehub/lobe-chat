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
import { FileQuestion } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager, ScrollView } from 'react-native';

import ChatItem from '@/features/ChatItem';
import SkeletonDetail from '@/features/discover/assistant/components/SkeletonDetail';
import { useAuth } from '@/store/_user';
import { useDiscoverStore } from '@/store/discover';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

const AssistantDetail = () => {
  const { slugs } = useLocalSearchParams<{ slugs: string[] }>();
  const identifier = decodeURIComponent(slugs.join('/'));
  const { user } = useAuth();
  const { t } = useTranslation(['common', 'discover']);
  const [isAdding, setIsAdding] = useState(false);
  const createSession = useSessionStore((s) => s.createSession);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

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
      setDrawerOpen(false);
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
        icon={FileQuestion}
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
          <Flexbox gap={16} paddingBlock={16} paddingInline={16}>
            {agent.examples?.map((item, index) => {
              const isUser = item.role === 'user';
              const avatarMeta = isUser
                ? {
                    avatar: user?.avatar,
                    title: user?.name || user?.username || 'User',
                  }
                : {
                    avatar: agent.avatar,
                    title: agent.title || 'Assistant',
                  };

              return (
                <ChatItem
                  avatar={avatarMeta}
                  key={index}
                  message={item.content}
                  placement={isUser ? 'right' : 'left'}
                  showTime={false}
                  showTitle={!isUser}
                />
              );
            })}
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
