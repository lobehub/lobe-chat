'use client';

import { Avatar, SortableList, Tag } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_AVATAR } from '@/const/meta';

const styles = stylex.create({
  title: { overflow: 'hidden', flex: '1', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

interface MemberItemProps {
  avatar?: string;
  background?: string;
  disabled?: boolean;
  isExternal?: boolean;
  title: string;
}

const MemberItem = memo<MemberItemProps>(({ avatar, background, disabled, isExternal, title }) => {
  const { t } = useTranslation('chat');

  return (
    <>
      {!disabled && <SortableList.DragHandle />}
      <Avatar
        emojiScaleWithBackground
        avatar={avatar || DEFAULT_AVATAR}
        background={background}
        size={24}
        style={{ flex: 'none' }}
      />
      <span {...stylex.props(styles.title)}>{title}</span>
      {isExternal && (
        <Tag size={'small'} style={{ flexShrink: 0 }}>
          {t('group.profile.external')}
        </Tag>
      )}
    </>
  );
});

export default MemberItem;
