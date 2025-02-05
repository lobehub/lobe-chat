'use client';

import { TabsNav } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Header from '../features/Header';
import Ld from './Ld';
import MetaData from './MetaData';
import Og from './Og';

const useStyles = createStyles(({ css, prefixCls }) => ({
  container: css`
    * {
      font-size: 12px;
    }
    .${prefixCls}-form-item {
      padding-block: 8px;
    }
  `,
}));

enum Tab {
  Ld = 'ld',
  Meta = 'meta',
  Og = 'og',
}

const MetadataViewer = memo(() => {
  const { styles } = useStyles();
  const [active, setActive] = useState<Tab>(Tab.Og);
  return (
    <Flexbox
      className={styles.container}
      height={'100%'}
      style={{ overflow: 'hidden', position: 'relative' }}
      width={'100%'}
    >
      <Header
        style={{ paddingInlineStart: 0 }}
        title={
          <TabsNav
            activeKey={active}
            items={[
              {
                key: Tab.Og,
                label: 'OG',
              },
              {
                key: Tab.Meta,
                label: 'MetaData',
              },
              {
                key: Tab.Ld,
                label: 'StructuredData',
              },
            ]}
            onChange={(v) => setActive(v as Tab)}
            style={{ margin: 16 }}
            variant={'compact'}
          />
        }
      />
      <Flexbox
        flex={1}
        height={'100%'}
        paddingInline={16}
        style={{ overflow: 'auto', paddingBottom: 16, position: 'relative' }}
        width={'100%'}
      >
        {active === Tab.Og && <Og />}
        {active === Tab.Meta && <MetaData />}
        {active === Tab.Ld && <Ld />}
      </Flexbox>
    </Flexbox>
  );
});

export default MetadataViewer;
