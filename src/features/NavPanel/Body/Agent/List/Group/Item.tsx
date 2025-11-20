import { AccordionItem, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ListMinusIcon } from 'lucide-react';
import React, { memo, useCallback } from 'react';
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
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const editing = useSessionStore((s) => s.sessionGroupRenamingId === id);
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

  return (
    <AccordionItem
      action={<Actions id={id} isCustomGroup toggleEditing={toggleEditing} />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
      disabled={editing}
      itemKey={id}
      key={id}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Flexbox align="center" gap={4} horizontal style={{ overflow: 'hidden' }}>
          <Icon icon={ListMinusIcon} style={{ opacity: 0.5 }} />
          <Text ellipsis fontSize={12} style={{ flex: 1 }} type={'secondary'} weight={500}>
            {name}
          </Text>
        </Flexbox>
      }
    >
      <Editing id={id} name={name} toggleEditing={toggleEditing} />
      <SessionList
        dataSource={children}
        itemClassName={cx(styles.item, expand && styles.itemExpand)}
      />
    </AccordionItem>
  );
});

export default GroupItem;
