'use client';

import { FluentEmoji, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import AgentsSuggest from './AgentsSuggest';
import QuestionSuggest from './QuestionSuggest';

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
      text-align: left;
    }
  `,
  title: css`
    margin-top: 0.2em;
    margin-bottom: 0;

    font-size: 32px;
    font-weight: bolder;
    line-height: 1;
    ${responsive.mobile} {
      font-size: 24px;
    }
  `,
}));

const InboxWelcome = memo(() => {
  const { t } = useTranslation('welcome');
  const [greeting, setGreeting] = useState<'morning' | 'noon' | 'afternoon' | 'night'>();
  const { styles } = useStyles();

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 4 && hours < 11) {
      setGreeting('morning');
    } else if (hours >= 11 && hours < 14) {
      setGreeting('noon');
    } else if (hours >= 14 && hours < 18) {
      setGreeting('afternoon');
    } else {
      setGreeting('night');
    }
  }, []);

  return (
    <Center padding={16} width={'100%'}>
      <Flexbox className={styles.container} gap={16} style={{ maxWidth: 800 }} width={'100%'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <FluentEmoji emoji={'👋'} size={40} type={'anim'} />
          <h1 className={styles.title}>{greeting && t(`guide.welcome.${greeting}`)}</h1>
        </Flexbox>
        <Markdown className={styles.desc} variant={'chat'}>
          {t('guide.defaultMessage')}
        </Markdown>
        <AgentsSuggest />
        <QuestionSuggest />
      </Flexbox>
    </Center>
  );
});

export default InboxWelcome;
