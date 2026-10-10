'use client';

import { Center, Flexbox, Icon } from '@lobehub/ui';
import {
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  accordionStyles,
  AccordionTrigger,
  ActionIcon,
  Text,
} from '@lobehub/ui/base-ui';
import { cssVar, cx } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MonitorIcon, PlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { getDeviceIcon } from '@/features/DeviceManager/getDeviceIcon';
import { openProjectTopicModal } from '@/features/Projects/WorkingDirectories/StartDirectoryModal';
import { useAgentStore } from '@/store/agent';
import { useDeviceStore } from '@/store/device';
import { deviceSelectors } from '@/store/device/selectors';
import { useProjectDirectories } from '@/store/projectWorkingDirectory';

import TopicItem from '../../List/Item';
import { useTopicListScope } from '../../TopicListScope';
import { type GroupItemComponentProps } from '../GroupedAccordion';

const DEVICE_GROUP_PREFIX = 'device:';

const GroupItem = memo<GroupItemComponentProps>(({ group }) => {
  const { t } = useTranslation('topic');
  const { t: tProject } = useTranslation('project');
  const { id, children } = group;
  const deviceId = id.startsWith(DEVICE_GROUP_PREFIX)
    ? id.slice(DEVICE_GROUP_PREFIX.length)
    : undefined;

  const scope = useTopicListScope();
  const directories = useProjectDirectories(scope?.projectId);
  const activeAgentId = useAgentStore((s) => s.activeAgentId);
  // The directory registry names most buckets; the device list covers devices
  // whose directory was removed from the project.
  useDeviceStore((s) => s.useFetchDevices)(
    !!deviceId && !directories.some((d) => d.deviceId === deviceId && d.deviceName),
  );
  const device = useDeviceStore(deviceSelectors.getDeviceById(deviceId));

  const name =
    directories.find((d) => d.deviceId === deviceId)?.deviceName ??
    device?.friendlyName ??
    device?.hostname ??
    t('groupTitle.byDevice.unknown');

  // Preselect a directory on this device so the new topic starts where the
  // group points; the modal's picker only lists instance-bound directories.
  const fallbackAgentId = scope?.coordinatorAgentId ?? activeAgentId;
  const canAddTopic = !!scope && !!deviceId && !!fallbackAgentId;
  const handleAddTopic = () => {
    if (!scope || !deviceId || !fallbackAgentId) return;
    const directory =
      directories.find((d) => d.deviceId === deviceId && d.instanceId) ??
      directories.find((d) => d.deviceId === deviceId);
    openProjectTopicModal({
      coordinatorAgentId: fallbackAgentId,
      directories,
      initialDirectoryId: directory?.id,
      projectId: scope.projectId,
      title: tProject('sidebar.newConversation'),
    });
  };

  return (
    <AccordionItem value={id}>
      <AccordionHeader>
        <AccordionTrigger style={{ paddingBlock: 4, paddingInline: '8px 4px' }}>
          <Flexbox horizontal align="center" gap={8} height={24} style={{ overflow: 'hidden' }}>
            <Center color={cssVar.colorTextTertiary} flex={'none'} height={18} width={18}>
              {device ? (
                getDeviceIcon(device.platform, 15)
              ) : (
                <Icon icon={MonitorIcon} size={{ size: 15, strokeWidth: 1.5 }} />
              )}
            </Center>
            <Text ellipsis fontSize={14} style={{ flex: 1 }}>
              {name}
            </Text>
          </Flexbox>
        </AccordionTrigger>
        {canAddTopic && (
          <div
            className={cx(
              'accordion-action',
              accordionStyles.action,
              accordionStyles.actionBorderless,
            )}
          >
            <ActionIcon
              icon={PlusIcon}
              size={'small'}
              title={tProject('sidebar.newConversation')}
              onClick={(e) => {
                e.stopPropagation();
                handleAddTopic();
              }}
            />
          </div>
        )}
      </AccordionHeader>
      <AccordionPanel contentStyle={{ padding: 0 }}>
        <Flexbox gap={1} paddingBlock={1}>
          {children.map((topic) => (
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
          ))}
        </Flexbox>
      </AccordionPanel>
    </AccordionItem>
  );
}, isEqual);

GroupItem.displayName = 'TopicByDeviceGroupItem';

export default GroupItem;
