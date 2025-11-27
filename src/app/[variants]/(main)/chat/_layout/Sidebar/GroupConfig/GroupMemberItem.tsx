'use client';

import { ActionIcon, Avatar, SortableList, Text } from '@lobehub/ui';
import { LoaderCircle, PinIcon, Play, StopCircle } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR } from '@/const/meta';

import { useStyles } from './style';

interface GroupMemberItemProps {
  actions?: ReactNode;
  avatar?: string;
  background?: string;
  generating?: boolean;
  generatingTooltip?: string;
  id: string;
  onClick?: () => void;
  onStopGenerating?: () => void;
  onStopGeneratingTooltip?: string;
  onTriggerSupervisor?: () => void;
  onTriggerSupervisorTooltip?: string;
  pin?: boolean;
  showActionsOnHover?: boolean;
  title: string;
}

const GroupMemberItem = memo<GroupMemberItemProps>(
  ({
    id,
    title,
    avatar,
    background,
    onClick,
    actions,
    showActionsOnHover = true,
    pin,
    generating,
    generatingTooltip,
    onStopGenerating,
    onStopGeneratingTooltip,
    onTriggerSupervisor,
    onTriggerSupervisorTooltip,
  }) => {
    const { styles } = useStyles();

    return (
      <SortableList.Item className={styles.memberItem} id={id} justify={'space-between'}>
        <Flexbox
          align={'center'}
          flex={1}
          gap={4}
          horizontal
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          style={{ overflow: 'hidden' }}
        >
          {pin ? (
            <SortableList.DragHandle
              disabled
              icon={PinIcon}
              style={{
                cursor: 'not-allowed',
              }}
            />
          ) : (
            <SortableList.DragHandle />
          )}
          <Flexbox flex={1} gap={8} horizontal style={{ overflow: 'hidden' }}>
            <Avatar
              avatar={avatar || DEFAULT_AVATAR}
              background={background}
              size={24}
              style={{ flex: 'none' }}
            />
            <Text ellipsis>{title}</Text>
          </Flexbox>
        </Flexbox>
        {actions !== undefined && (
          <Flexbox className={showActionsOnHover ? 'show-on-hover' : undefined} gap={4} horizontal>
            {actions}
          </Flexbox>
        )}
        {generating ? (
          <Flexbox gap={4} horizontal>
            <ActionIcon icon={LoaderCircle} size={'small'} spin title={generatingTooltip} />
            {onStopGenerating && (
              <ActionIcon
                icon={StopCircle}
                onClick={(e) => {
                  e.stopPropagation();
                  onStopGenerating();
                }}
                size={'small'}
                title={onStopGeneratingTooltip || 'Stop generating'}
              />
            )}
          </Flexbox>
        ) : (
          onTriggerSupervisor && (
            <ActionIcon
              className="show-on-hover"
              icon={Play}
              onClick={(e) => {
                e.stopPropagation();
                onTriggerSupervisor();
              }}
              size={'small'}
              title={onTriggerSupervisorTooltip || 'Trigger supervisor decision'}
            />
          )
        )}
      </SortableList.Item>
    );
  },
);

export default GroupMemberItem;
