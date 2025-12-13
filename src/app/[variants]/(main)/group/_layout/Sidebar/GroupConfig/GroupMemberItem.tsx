'use client';

import { Avatar, SortableList, Text } from '@lobehub/ui';
import { PinIcon } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_AVATAR } from '@/const/meta';

import { useStyles } from './style';

interface GroupMemberItemProps {
  actions?: ReactNode;
  avatar?: string;
  background?: string;
  id: string;
  onClick?: () => void;
  pin?: boolean;
  showActionsOnHover?: boolean;
  title: string;
}

const GroupMemberItem = memo<GroupMemberItemProps>(
  ({ id, title, avatar, background, onClick, actions, showActionsOnHover = true, pin }) => {
    const { styles } = useStyles();

    return (
      <SortableList.Item className={styles.memberItem} id={id} justify={'space-between'}>
        <Flexbox
          align={'center'}
          flex={1}
          gap={4}
          horizontal
          onClick={(e) => {
            onClick?.();
            e.stopPropagation();
          }}
          style={{ overflow: 'hidden' }}
        >
          {pin ? (
            <SortableList.DragHandle
              disabled
              icon={PinIcon}
              size={'small'}
              style={{ cursor: 'not-allowed', height: 28, width: 28 }}
            />
          ) : (
            <SortableList.DragHandle size={'small'} style={{ height: 28, width: 28 }} />
          )}
          <Flexbox flex={1} gap={8} horizontal style={{ overflow: 'hidden' }}>
            <Avatar
              avatar={avatar || DEFAULT_AVATAR}
              background={background}
              size={20}
              style={{ flex: 'none' }}
            />
            <Text ellipsis style={{ fontSize: 14 }}>
              {title}
            </Text>
          </Flexbox>
        </Flexbox>
        {actions !== undefined && (
          <Flexbox className={showActionsOnHover ? 'show-on-hover' : undefined} gap={4} horizontal>
            {actions}
          </Flexbox>
        )}
      </SortableList.Item>
    );
  },
);

export default GroupMemberItem;
