'use client';

import { Accordion } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import TopicItem from '../../List/Item';
import GroupItem from './GroupItem';

const ByTimeMode = memo(() => {
  const { t } = useTranslation('topic');
  const [activeTopicId, activeThreadId] = useChatStore((s) => [s.activeTopicId, s.activeThreadId]);
  const groupTopics = useChatStore(topicSelectors.groupedTopicsSelector, isEqual);

  const [topicGroupKeys, updateSystemStatus] = useGlobalStore((s) => [
    systemStatusSelectors.topicGroupKeys(s),
    s.updateSystemStatus,
  ]);

  const expandedKeys = useMemo(() => {
    return topicGroupKeys || groupTopics.map((group) => group.id);
  }, [topicGroupKeys, groupTopics]);

  return (
    <>
      {/* Default topic */}
      <TopicItem active={!activeTopicId} fav={false} title={t('defaultTitle')} />

      {/* Grouped topics */}
      <Accordion
        disableAnimation
        expandedKeys={expandedKeys}
        onExpandedChange={(keys) => updateSystemStatus({ expandTopicGroupKeys: keys as any })}
      >
        {groupTopics.map((group) => (
          <GroupItem
            activeThreadId={activeThreadId}
            activeTopicId={activeTopicId}
            group={group}
            key={group.id}
          />
        ))}
      </Accordion>
    </>
  );
});

ByTimeMode.displayName = 'ByTimeMode';

export default ByTimeMode;
