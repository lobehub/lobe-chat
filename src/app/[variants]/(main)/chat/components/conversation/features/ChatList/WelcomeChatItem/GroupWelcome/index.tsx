'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

import GroupUsageSuggest from './GroupUsageSuggest';

const useStyles = createStyles(({ css, responsive }) => ({
  container: css`
    align-items: center;
    ${responsive.mobile} {
      align-items: flex-start;
    }
  `,
  desc: css`
    font-size: 14px;
    text-align: center;
    ${responsive.mobile} {
      text-align: start;
    }
  `,
  title: css`
    margin-block: 0.2em 0;
    font-size: 32px;
    font-weight: bolder;
    line-height: 1;
    ${responsive.mobile} {
      font-size: 24px;
    }
  `,
}));

const GroupWelcome = memo(() => {
  const { styles } = useStyles();
  const mobile = useServerConfigStore((s) => s.isMobile);
  const { showWelcomeSuggest } = useServerConfigStore(featureFlagsSelectors);

  return (
    <Center padding={16} width={'100%'}>
      <Flexbox
        className={styles.container}
        gap={16}
        style={{ maxWidth: 800, paddingTop: '20px' }}
        width={'100%'}
      >
        {showWelcomeSuggest && <GroupUsageSuggest mobile={mobile} />}
      </Flexbox>
    </Center>
  );
});

export default GroupWelcome;
