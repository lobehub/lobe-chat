import { AccordionItem, Icon, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ListMinusIcon } from 'lucide-react';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SessionList from '@/features/NavPanel/Body/Agent/List/List';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { CustomSessionGroup } from '@/types/session';

import Actions from './Actions';

const useStyles = createStyles(({ css, token }) => ({
  base: css`
    overflow: hidden;
    transition:
      height,
      opacity,
      margin-block-start 200ms ${token.motioneaseinout};
  `,
  hide: css`
    height: 0;
    margin-block-start: -12px;
    opacity: 0;
  `,
  item: css`
    transition: padding-inline-start 200ms ${token.motioneaseinout};
  `,
  itemExpand: css`
    padding-inline-start: 16px;
  `,
}));

const GroupItem = memo<CustomSessionGroup>(({ children, id, name }) => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const { cx, styles } = useStyles();

  return (
    <AccordionItem
      action={<Actions id={id} isCustomGroup />}
      classNames={{
        header: cx(styles.base, !expand && styles.hide),
      }}
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
      <SessionList
        dataSource={children}
        itemClassName={cx(styles.item, expand && styles.itemExpand)}
      />
    </AccordionItem>
  );
});

export default GroupItem;
