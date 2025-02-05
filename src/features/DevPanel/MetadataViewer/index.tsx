'use client';

import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

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
      <Segmented
        block
        onChange={setActive}
        options={[
          {
            label: 'OG',
            value: Tab.Og,
          },
          {
            label: 'MetaData',
            value: Tab.Meta,
          },
          {
            label: 'StructuredData',
            value: Tab.Ld,
          },
        ]}
        style={{ margin: 16 }}
        value={active}
      />
      <Flexbox
        flex={1}
        height={'100%'}
        paddingInline={16}
        style={{ overflow: 'auto', paddingBottom: 16, position: 'relative' }}
        width={'100%'}
      >
        {active === 'og' && <Og />}
        {active === 'meta' && <MetaData />}
        {active === 'ld' && <Ld />}
      </Flexbox>
    </Flexbox>
  );
});

export default MetadataViewer;
