'use client';

import { Button, Flexbox, SearchBar, Text, TextArea, useModalContext } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AgentAvatar from '@/features/HomeSidebar/Body/Agent/List/AgentItem/Avatar';
import { useFetchAgentList } from '@/hooks/useFetchAgentList';
import { useHomeStore } from '@/store/home';
import { homeAgentListSelectors } from '@/store/home/selectors';

import SelectCircle from '../SelectCircle';
import type { ForwardTarget } from '../useForwardMessages';
import { useForwardTopic } from '../useForwardTopic';

const styles = stylex.create({
  body: { blockSize: '460px' },
  context: {
    flex: '1',
    padding: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: cssVar.borderRadiusLG,
    backgroundColor: cssVar.colorFillQuaternary,
    backgroundImage: 'none',
  },
  divider: {
    alignSelf: 'stretch',
    inlineSize: '1px',
    backgroundColor: cssVar.colorBorderSecondary,
    backgroundImage: 'none',
  },
  list: { overflowY: 'auto', flex: '1' },
  row: {
    cursor: 'pointer',
    minBlockSize: '44px',
    paddingBlock: '6px',
    paddingInline: '8px',
    borderRadius: cssVar.borderRadiusLG,
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillTertiary },
    backgroundImage: { 'default': null, ':hover': 'none' },
  },
  selected: { backgroundColor: cssVar.colorFillQuaternary, backgroundImage: 'none' },
});

export interface TopicForwardContentProps {
  cancelSourceContinuation?: boolean;
  sourceAgentId: string;
  topicId: string;
  topicTitle: string;
}

export const TopicForwardContent = ({
  cancelSourceContinuation,
  sourceAgentId,
  topicId,
  topicTitle,
}: TopicForwardContentProps) => {
  const { t } = useTranslation('chat');
  const { close } = useModalContext();
  const [keyword, setKeyword] = useState('');
  const [note, setNote] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const agents = useHomeStore(homeAgentListSelectors.allAgents);
  const forwardTopic = useForwardTopic({
    agentId: sourceAgentId,
    cancelSourceContinuation,
    topicId,
  });

  useFetchAgentList();

  const candidates = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return agents
      .filter((agent) => agent.type === 'agent' && agent.id !== sourceAgentId)
      .filter((agent) => !query || (agent.title || '').toLowerCase().includes(query));
  }, [agents, keyword, sourceAgentId]);

  const handleForward = () => {
    const targets: ForwardTarget[] = selectedIds
      .map((id) => agents.find((agent) => agent.id === id))
      .filter((agent): agent is NonNullable<typeof agent> => !!agent)
      .map((agent) => ({ id: agent.id, title: agent.title }));
    if (targets.length === 0) return;

    forwardTopic(targets, note);
    close();
  };

  return (
    <Flexbox horizontal className={stylex.props(styles.body).className} gap={16}>
      <Flexbox flex={1} gap={8} style={{ minWidth: 0 }}>
        <SearchBar
          allowClear
          placeholder={t('messageForward.modal.searchPlaceholder')}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Flexbox className={stylex.props(styles.list).className} gap={4}>
          {candidates.length === 0 ? (
            <Flexbox align={'center'} justify={'center'} padding={24}>
              <Text type={'secondary'}>{t('messageForward.modal.empty')}</Text>
            </Flexbox>
          ) : (
            candidates.map((agent) => {
              const selected = selectedIds.includes(agent.id);
              return (
                <Flexbox
                  horizontal
                  align={'center'}
                  className={stylex.props(styles.row, selected && styles.selected).className}
                  gap={8}
                  key={agent.id}
                  onClick={() =>
                    setSelectedIds((ids) =>
                      selected ? ids.filter((id) => id !== agent.id) : [...ids, agent.id],
                    )
                  }
                >
                  <AgentAvatar
                    avatar={typeof agent.avatar === 'string' ? agent.avatar : undefined}
                  />
                  <Text ellipsis style={{ flex: 1 }}>
                    {agent.title || t('untitledAgent')}
                  </Text>
                  <SelectCircle checked={selected} />
                </Flexbox>
              );
            })
          )}
        </Flexbox>
      </Flexbox>

      <div {...stylex.props(styles.divider)} />

      <Flexbox flex={1} gap={12} style={{ minWidth: 0 }}>
        <Text type={'secondary'}>{t('messageForward.topic.context')}</Text>
        <Flexbox className={stylex.props(styles.context).className} gap={8}>
          <Text ellipsis strong>
            {topicTitle}
          </Text>
          <Text type={'secondary'}>{t('messageForward.topic.description')}</Text>
        </Flexbox>
        <TextArea
          autoSize={{ maxRows: 4, minRows: 2 }}
          placeholder={t('messageForward.modal.notePlaceholder')}
          resize={false}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <Flexbox horizontal gap={8} justify={'flex-end'}>
          <Button onClick={close}>{t('messageForward.bar.cancel')}</Button>
          <Button disabled={selectedIds.length === 0} type={'primary'} onClick={handleForward}>
            {selectedIds.length > 0
              ? t('messageForward.modal.sendCount', { count: selectedIds.length })
              : t('messageForward.bar.forward')}
          </Button>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
