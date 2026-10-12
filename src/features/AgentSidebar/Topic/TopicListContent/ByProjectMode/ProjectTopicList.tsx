import { Center, Flexbox, Icon } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LaptopIcon } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type ExecutionStatusVisual,
  TOPIC_GROUP_VISUALS,
  TOPIC_STATUS_VISUALS,
} from '@/components/ExecutionStatus';
import { projectDirectoryDeviceName } from '@/features/ChatInput/ControlBar/projectDeviceTargets';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { deviceSelectors, useDeviceStore } from '@/store/device';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useProjectDirectories } from '@/store/projectWorkingDirectory';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';
import { type ChatTopic, type GroupedTopic } from '@/types/topic';

import TopicItem from '../../List/Item';
import { formatTimeGroupId } from '../ByTimeMode/timeGroupTitle';
import {
  DEVICE_SUB_GROUP_PREFIX,
  groupProjectTopics,
  UNKNOWN_DEVICE_SUB_GROUP_ID,
} from './subGroups';

const STATUS_ICON: Record<string, ExecutionStatusVisual> = {
  ...TOPIC_STATUS_VISUALS,
  ...TOPIC_GROUP_VISUALS,
};

const renderTopic = (topic: ChatTopic) => (
  <TopicItem
    fav={topic.favorite}
    id={topic.id}
    key={topic.id}
    metadata={topic.metadata}
    runStartedAt={topic.runStartedAt}
    status={topic.status}
    title={topic.title}
    userId={topic.userId}
  />
);

interface ProjectTopicListProps {
  /** The byProject group id — the sub-group mode is remembered per group. */
  groupId: string;
  topics: ChatTopic[];
}

/**
 * Topics of one byProject sidebar group, optionally sectioned by device, time
 * or status (picked from the group's "more" menu).
 */
const ProjectTopicList = memo<ProjectTopicListProps>(({ groupId, topics }) => {
  const { t } = useTranslation('topic');
  const mode = useGlobalStore(systemStatusSelectors.projectTopicSubGroupMode(groupId));
  const topicSortBy = useUserStore(preferenceSelectors.topicSortBy);
  const field = topicSortBy === 'createdAt' ? 'createdAt' : 'updatedAt';

  useDeviceStore((s) => s.useFetchDevices)(mode === 'byDevice');
  const devices = useDeviceStore(deviceSelectors.deviceList);
  const directories = useProjectDirectories();

  // A joined id string, not the Set itself: the selector must return something
  // comparable or every operation write would re-render the list.
  const runningIdsKey = useChatStore((s) => {
    if (mode !== 'byStatus') return '';
    const running = operationSelectors.visiblyRunningTopicIds(s);
    return topics
      .filter((topic) => running.has(topic.id))
      .map((topic) => topic.id)
      .join(',');
  });

  const resolveDeviceId = useCallback(
    (topic: ChatTopic) =>
      (topic.projectWorkingDirectoryId &&
        directories.find((directory) => directory.id === topic.projectWorkingDirectoryId)
          ?.deviceId) ||
      topic.metadata?.boundDeviceId,
    [directories],
  );

  const groups = useMemo(
    () =>
      groupProjectTopics(topics, mode, {
        field,
        loadingTopicIds: runningIdsKey ? new Set(runningIdsKey.split(',')) : undefined,
        resolveDeviceId,
      }),
    [topics, mode, field, runningIdsKey, resolveDeviceId],
  );

  const getTitle = useCallback(
    (group: GroupedTopic) => {
      if (mode === 'byStatus') return t(`groupTitle.byStatus.${group.id}` as any);
      if (mode === 'byTime')
        return formatTimeGroupId(group.id) ?? t(`groupTitle.byTime.${group.id}` as any);
      if (group.id === UNKNOWN_DEVICE_SUB_GROUP_ID) return t('groupTitle.byDevice.unknown');

      const deviceId = group.id.slice(DEVICE_SUB_GROUP_PREFIX.length);
      const directory = directories.find((item) => item.deviceId === deviceId);
      if (directory) return projectDirectoryDeviceName(directory, devices);
      const device = devices.find((item) => item.deviceId === deviceId);
      return device?.friendlyName || device?.hostname || deviceId;
    },
    [mode, t, directories, devices],
  );

  if (!groups) {
    return (
      <Flexbox gap={1} paddingBlock={1}>
        {topics.map(renderTopic)}
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={4} paddingBlock={1}>
      {groups.map((group) => {
        const icon =
          mode === 'byStatus'
            ? STATUS_ICON[group.id]
            : mode === 'byDevice'
              ? { color: cssVar.colorTextTertiary, icon: LaptopIcon }
              : undefined;
        return (
          <Flexbox gap={1} key={group.id}>
            <Flexbox
              horizontal
              align="center"
              gap={6}
              height={24}
              paddingInline={'12px 8px'}
              style={{ overflow: 'hidden' }}
            >
              {icon && (
                <Center flex={'none'} height={16} width={16}>
                  <Icon color={icon.color} icon={icon.icon} size={{ size: 12 }} />
                </Center>
              )}
              <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
                {getTitle(group)}
              </Text>
            </Flexbox>
            {group.children.map(renderTopic)}
          </Flexbox>
        );
      })}
    </Flexbox>
  );
}, isEqual);

ProjectTopicList.displayName = 'ProjectTopicList';

export default ProjectTopicList;
