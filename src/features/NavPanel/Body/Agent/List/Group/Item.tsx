import { AccordionItem, Icon, Text } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { ListMinusIcon, Loader2 } from 'lucide-react';
import React, { memo, useCallback, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SessionList from '@/features/NavPanel/Body/Agent/List/List';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { CustomSessionGroup } from '@/types/session';

import Actions from './Actions';
import Editing from './Editing';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motionEaseInOut};
  `,
  hide: css`
    pointer-events: none;
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
  item: css`
    transition: padding-inline-start 200ms ${token.motionEaseInOut};
  `,
  itemExpand: css`
    padding-inline-start: 16px;
  `,
}));

const GroupItem = memo<CustomSessionGroup>(({ children, id, name }) => {
  const theme = useTheme();
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const [editing, isUpdating] = useSessionStore((s) => [
    s.sessionGroupRenamingId === id,
    s.sessionGroupUpdatingId === id,
  ]);
  const { cx, styles } = useStyles();

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useSessionStore.setState(
        { sessionGroupRenamingId: visible ? id : null },
        false,
        'toggleEditing',
      );
    },
    [id],
  );

  const groupIcon = useMemo(() => {
    if (isUpdating) {
      return <Icon icon={Loader2} spin style={{ opacity: 0.5 }} />;
    }
    return <Icon icon={ListMinusIcon} style={{ opacity: 0.5 }} />;
  }, [isUpdating, theme.colorTextDescription]);

  return (
    <AccordionItem
      action={<Actions id={id} isCustomGroup toggleEditing={toggleEditing} />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
      disabled={editing || isUpdating}
      itemKey={id}
      key={id}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Flexbox align="center" gap={4} horizontal style={{ overflow: 'hidden' }}>
          {groupIcon}
          <Text ellipsis fontSize={12} style={{ flex: 1 }} type={'secondary'} weight={500}>
            {name}
          </Text>
        </Flexbox>
      }
    >
      <Editing id={id} name={name} toggleEditing={toggleEditing} />
      <SessionList
        dataSource={children}
        groupId={id}
        itemClassName={cx(styles.item, expand && styles.itemExpand)}
      />
    </AccordionItem>
  );
});

export default GroupItem;
