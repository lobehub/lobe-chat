'use client';

import { ActionIcon, Avatar, SortableList, Text } from '@lobehub/ui';
import { LoaderCircle, PinIcon } from 'lucide-react';
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
            <Avatar avatar={avatar || DEFAULT_AVATAR} background={background} size={24} />
            <Text ellipsis>{title}</Text>
          </Flexbox>
        </Flexbox>
        {actions !== undefined && (
          <Flexbox className={showActionsOnHover ? 'show-on-hover' : undefined} gap={4} horizontal>
            {actions}
          </Flexbox>
        )}
        {generating && (
          <ActionIcon icon={LoaderCircle} size={'small'} spin title={generatingTooltip} />
        )}
      </SortableList.Item>
    );
  },
);

export default GroupMemberItem;
