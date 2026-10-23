'use client';

import { Center, Flexbox, Spin, Text } from '@lobehub/ui';
import { memo, useCallback, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';

import AsyncError from '@/components/AsyncError';
import TopicActions from '@/features/AgentSidebar/Topic/List/Item/Actions';
import ConversationWorkspace from '@/features/Conversation/Workspace';
import NavHeader from '@/features/NavHeader';
import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import ChatConversation from '@/routes/(main)/agent/features/Conversation';
import ChatHydration from '@/routes/(main)/agent/features/Conversation/ChatHydration';
import TerminalPanelToggle from '@/routes/(main)/agent/features/Conversation/Header/TerminalPanelToggle';
import WorkingPanelToggle from '@/routes/(main)/agent/features/Conversation/Header/WorkingPanelToggle';
import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useCurrentProjectDetail, useProjectStore } from '@/store/project';
import {
  useProjectDirectories,
  useProjectDirectoryStore,
  useProjectTopics,
} from '@/store/projectWorkingDirectory';

import { getProjectConversationPath } from '../Layout/navigation';
import { isFreshProjectTopic } from './isFreshProjectTopic';
import { useRevalidateWhileUnlisted } from './useRevalidateWhileUnlisted';

const ProjectConversation = memo(() => {
  const { t } = useTranslation('project');
  const { projectId, topicId } = useParams<{ projectId: string; topicId?: string }>();
  const detail = useCurrentProjectDetail(projectId);
  const detailSWR = useProjectStore((s) => s.useFetchProjectDetail)(projectId);
  const topicsRequest = useProjectDirectoryStore((s) => s.useFetchProjectTopics)(
    detail?.project.id,
  );
  const topics = useProjectTopics(detail?.project.id);
  const selectedTopic = topics.find((topic) => topic.id === topicId);
  const projectSlug = detail?.project.slug ?? projectId;
  const storedTopic = useChatStore((s) =>
    topicId ? topicSelectors.getTopicById(topicId)(s) : undefined,
  );
  // A sidebar "+" stages a directory of this project instead of creating a
  // row (see `startProjectTopicDraft`): the blank conversation belongs to the
  // staged agent until its first message creates the topic.
  const pendingDirectory = useChatStore((s) => s.pendingNewTopicDirectory);
  const directoriesRequest = useProjectDirectoryStore((s) => s.useFetchDirectories)(
    detail?.project.id,
  );
  const directories = useProjectDirectories(detail?.project.id);
  const draftAgentId =
    !topicId &&
    pendingDirectory &&
    directories.some((d) => d.id === pendingDirectory.projectWorkingDirectoryId)
      ? pendingDirectory.agentId
      : undefined;
  const chatAgentId = useChatStore((s) => s.activeAgentId);
  // Keep the conversation on its agent instead of flashing "not found" while
  // the project list catches up with a topic the first send just created.
  const isFreshTopic = isFreshProjectTopic({
    listed: !!selectedTopic,
    projectId: detail?.project.id,
    storedTopic,
    topicId,
  });
  const conversationAgentId = topicId
    ? (selectedTopic?.agentId ?? (isFreshTopic ? chatAgentId : undefined))
    : draftAgentId;
  useRevalidateWhileUnlisted(isFreshTopic, topicId, topicsRequest.revalidate);
  const topicTitle = storedTopic?.title;

  const agent = useInitAgentConfig(conversationAgentId);
  const topicDetail = useChatStore((s) => s.useFetchTopicDetail)(selectedTopic?.id);

  useLayoutEffect(() => {
    if (!conversationAgentId) return;

    useAgentStore.setState(
      { activeAgentId: conversationAgentId },
      false,
      'ProjectConversation/syncAgentId',
    );
    useChatStore.setState(
      { activeAgentId: conversationAgentId },
      false,
      'ProjectConversation/syncAgentId',
    );
  }, [conversationAgentId]);

  const getConversationPath = useCallback(
    () => getProjectConversationPath(projectSlug!),
    [projectSlug],
  );
  const getTopicPath = useCallback(
    (_agentId: string, topicId: string) => getProjectConversationPath(projectSlug!, topicId),
    [projectSlug],
  );

  if (topicDetail.error)
    return <AsyncError error={topicDetail.error} variant="page" onRetry={topicDetail.revalidate} />;
  if (agent.error) return <AsyncError error={agent.error} variant="page" onRetry={agent.mutate} />;
  if (topicsRequest.error)
    return (
      <AsyncError error={topicsRequest.error} variant="page" onRetry={topicsRequest.revalidate} />
    );
  if (!topicId && !draftAgentId) {
    // A "+" may have staged a draft whose directory list is still loading;
    // wait for it rather than sending the draft away.
    if (pendingDirectory && !directoriesRequest.hasData)
      return (
        <Center height="100%" width="100%">
          <Spin size="small" />
        </Center>
      );
    // Other new project conversations start from the project home composer.
    return <Navigate replace relative="path" to=".." />;
  }
  if (topicId && topicsRequest.hasData && !selectedTopic && !isFreshTopic)
    return (
      <Center height="100%">
        <Text>{t('topics.notFound')}</Text>
      </Center>
    );
  if (detailSWR.error && !detail) {
    return <AsyncError error={detailSWR.error} variant="page" onRetry={detailSWR.revalidate} />;
  }
  if (
    !detail ||
    !conversationAgentId ||
    agent.isLoading ||
    (!storedTopic && topicDetail.isValidating) ||
    chatAgentId !== conversationAgentId
  ) {
    return (
      <Center height="100%" width="100%">
        <Spin size="small" />
      </Center>
    );
  }

  return (
    <ConversationWorkspace
      header={
        <NavHeader
          left={
            <Text ellipsis weight={600}>
              {topicTitle || selectedTopic?.title || t('sidebar.newConversation')}
            </Text>
          }
          right={
            <Flexbox horizontal align="center" gap={4}>
              <TerminalPanelToggle />
              <WorkingPanelToggle />
              {topicId && (
                <TopicActions
                  id={topicId}
                  status={selectedTopic?.status}
                  title={topicTitle || selectedTopic?.title || t('directories.untitled')}
                  completionLabel={t(
                    selectedTopic?.status === 'completed' ? 'topics.resume' : 'topics.complete',
                  )}
                />
              )}
            </Flexbox>
          }
        />
      }
    >
      <ChatHydration getConversationPath={getConversationPath} getTopicPath={getTopicPath} />
      <ChatConversation />
    </ConversationWorkspace>
  );
});

ProjectConversation.displayName = 'ProjectConversation';

export default ProjectConversation;
