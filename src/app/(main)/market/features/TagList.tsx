'use client';

import { Button } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { agentMarketSelectors, useMarketStore } from '@/store/market';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    color: ${token.colorBgLayout};
    background: ${token.colorPrimary};

    &:hover {
      color: ${token.colorBgLayout} !important;
      background: ${token.colorPrimary} !important;
    }
  `,
  tag: css`
    background: ${token.colorBgContainer};
    border: none;

    &:hover {
      background: ${token.colorBgElevated} !important;
    }
  `,
}));

const TagList = memo(() => {
  const { cx, styles } = useStyles();
  const { md = true } = useResponsive();
  const [searchKeywords, setSearchKeywords] = useMarketStore((s) => [
    s.searchKeywords,
    s.setSearchKeywords,
  ]);
  const agentTagList = useMarketStore(agentMarketSelectors.getAgentTagList, isEqual);

  const list = md ? agentTagList : agentTagList.slice(0, 20);

  return (
    <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
      {list.map((item) => {
        const isActive = searchKeywords === item;
        return (
          <Button
            className={cx(styles.tag, isActive && styles.active)}
            key={item}
            onClick={() => {
              setSearchKeywords(isActive ? '' : item);
            }}
            shape={'round'}
            size={'small'}
          >
            {startCase(item)}
          </Button>
        );
      })}
    </Flexbox>
  );
});

export default TagList;
