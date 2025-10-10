'use client';

import { FluentEmoji, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGreeting } from '@/hooks/useGreeting';
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
  const greeting = useGreeting();
  const { showWelcomeSuggest } = useServerConfigStore(featureFlagsSelectors);
  const { t } = useTranslation('welcome');

  return (
    <Center padding={16} width={'100%'}>
      <Flexbox className={styles.container} gap={16} style={{ maxWidth: 800 }} width={'100%'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <FluentEmoji emoji={'👥'} size={40} type={'anim'} />
          <h1 className={styles.title}>{greeting}</h1>
        </Flexbox>
        <Markdown className={styles.desc} variant={'chat'}>
          {t('guide.groupMessage')}
        </Markdown>
        {showWelcomeSuggest && <GroupUsageSuggest mobile={mobile} />}
      </Flexbox>
    </Center>
  );
});

export default GroupWelcome;
