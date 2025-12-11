import { ActionIcon, Block } from '@lobehub/ui';
import { Dropdown, Popover } from 'antd';
import { createStyles } from 'antd-style';
import type { ItemType } from 'antd/es/menu/interface';
import { ArrowRightFromLineIcon, ChevronsUpDownIcon, Clock3Icon, PlusIcon } from 'lucide-react';
import { Suspense, memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import AgentAvatar from '@/app/[variants]/(main)/home/_layout/Body/Agent/List/AgentItem/Avatar';
import { AgentModalProvider } from '@/app/[variants]/(main)/home/_layout/Body/Agent/ModalProvider';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import NavHeader from '@/features/NavHeader';
import NavItem from '@/features/NavPanel/components/NavItem';
import SkeletonList from '@/features/NavPanel/components/SkeletonList';
import { useFetchAgentList } from '@/hooks/useFetchAgentList';
import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useHomeStore } from '@/store/home';
import { homeAgentListSelectors } from '@/store/home/selectors';

const useStyles = createStyles(({ css }) => ({
  fadeContainer: css`
    display: flex;
    gap: 4px;
    align-items: center;
    transition: opacity 0.2s ease-in-out;
  `,
  fadeIn: css`
    opacity: 1;
  `,
  fadeOut: css`
    pointer-events: none;
    opacity: 0;
  `,
}));

interface AgentSelectorProps {
  agentId: string;
  onAgentChange: (id: string) => void;
}

const AgentSelector = memo<AgentSelectorProps>(({ agentId, onAgentChange }) => {
  const { t } = useTranslation(['chat', 'common']);
  const [open, setOpen] = useState(false);

  const agents = useHomeStore(homeAgentListSelectors.allAgents);
  const isAgentListInit = useHomeStore(homeAgentListSelectors.isAgentListInit);
  const pageAgentId = useAgentStore((s) => s.builtinAgentIdMap['page-agent']);

  useFetchAgentList();

  // Always include the Built-in Copilot (page agent) in the agent list
  const agentsWithBuiltin = useMemo(() => {
    // Check if page agent is already in the list
    const hasPageAgent = agents.some((agent) => agent.id === pageAgentId);

    // If page agent exists and is not in the list, add it at the beginning
    if (pageAgentId && !hasPageAgent) {
      return [
        {
          id: pageAgentId,
          title: t('builtinCopilot', { defaultValue: 'Built-in Copilot', ns: 'chat' }),
          avatar: null,
          description: null,
          type: 'agent' as const,
          pinned: false,
          updatedAt: new Date(),
        },
        ...agents,
      ];
    }

    return agents;
  }, [agents, pageAgentId, t]);

  const activeAgent = useMemo(
    () => agentsWithBuiltin.find((agent) => agent.id === agentId),
    [agentId, agentsWithBuiltin],
  );

  const renderAgents = (
    <Flexbox
      gap={4}
      padding={8}
      style={{
        maxHeight: '50vh',
        overflowY: 'auto',
      }}
    >
      {agentsWithBuiltin.map((agent) => (
        <NavItem
          active={agent.id === agentId}
          icon={
            <AgentAvatar avatar={typeof agent.avatar === 'string' ? agent.avatar : undefined} />
          }
          key={agent.id}
          onClick={() => {
            onAgentChange(agent.id);
            setOpen(false);
          }}
          title={agent.title || t('untitledAgent', { ns: 'chat' })}
        />
      ))}
    </Flexbox>
  );

  return (
    <Popover
      arrow={false}
      content={
        <Suspense fallback={<SkeletonList rows={6} />}>
          <AgentModalProvider>
            {isAgentListInit ? renderAgents : <SkeletonList rows={6} />}
          </AgentModalProvider>
        </Suspense>
      }
      onOpenChange={setOpen}
      open={open}
      placement="bottomLeft"
      styles={{
        body: {
          padding: 0,
          width: 240,
        },
      }}
      trigger={['click']}
    >
      <Block
        align={'center'}
        clickable
        gap={4}
        horizontal
        padding={2}
        style={{
          minWidth: 32,
        }}
        variant={'borderless'}
      >
        <AgentAvatar
          avatar={typeof activeAgent?.avatar === 'string' ? activeAgent.avatar : undefined}
        />
        <ActionIcon
          icon={ChevronsUpDownIcon}
          size={{
            blockSize: 28,
            size: 16,
          }}
          style={{
            width: 24,
          }}
        />
      </Block>
    </Popover>
  );
});

interface CopilotToolbarProps {
  agentId: string;
  isHovered: boolean;
}

const CopilotToolbar = memo<CopilotToolbarProps>(({ agentId, isHovered }) => {
  const { t } = useTranslation('topic');
  const { styles, cx } = useStyles();
  const setActiveAgentId = useAgentStore((s) => s.setActiveAgentId);

  // Fetch topics for the agent builder
  useChatStore((s) => s.useFetchTopics)(true, { agentId });

  const [activeTopicId, switchTopic, topics] = useChatStore((s) => [
    s.activeTopicId,
    s.switchTopic,
    s.topicDataMap[agentId]?.items,
  ]);

  // Find active topic from the agent's topics list directly
  const activeTopic = useMemo(
    () => topics?.find((topic) => topic.id === activeTopicId),
    [topics, activeTopicId],
  );

  const items = useMemo<ItemType[]>(
    () =>
      (topics || []).map((topic) => ({
        key: topic.id,
        label: topic.title,
        onClick: () => switchTopic(topic.id),
      })),
    [topics, t, switchTopic],
  );

  const [toggleRightPanel] = useGlobalStore((s) => [s.toggleRightPanel]);

  return (
    <NavHeader
      left={
        <Flexbox align="center" gap={8} horizontal>
          <AgentSelector agentId={agentId} onAgentChange={setActiveAgentId} />
        </Flexbox>
      }
      right={
        <>
          <div className={cx(styles.fadeContainer, isHovered ? styles.fadeIn : styles.fadeOut)}>
            <ActionIcon
              icon={PlusIcon}
              onClick={() => switchTopic()}
              size={DESKTOP_HEADER_ICON_SIZE}
              title={t('actions.addNewTopic')}
            />
            <Dropdown
              disabled={!topics || topics.length === 0}
              menu={{
                items,
                selectedKeys: activeTopicId ? [activeTopicId] : [],
              }}
              overlayStyle={{
                maxHeight: 600,
                minWidth: 200,
                overflowY: 'auto',
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <ActionIcon disabled={!topics || topics.length === 0} icon={Clock3Icon} />
            </Dropdown>
          </div>
          <ActionIcon
            icon={ArrowRightFromLineIcon}
            onClick={() => toggleRightPanel()}
            size={DESKTOP_HEADER_ICON_SIZE}
          />
        </>
      }
      showTogglePanelButton={false}
    />
  );
});

CopilotToolbar.displayName = 'TopicSelector';

export default CopilotToolbar;
