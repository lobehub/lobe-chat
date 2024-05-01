'use client';

import { Grid, Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import {
  Book,
  Feather,
  FileClock,
  Github,
  Heart,
  HeartHandshake,
  Home,
  Lock,
  Rss,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ABOUT, CHANGELOG, FEEDBACK, GITHUB, PRIVACY_URL, TERMS_URL } from '@/const/url';

const useStyles = createStyles(({ css, token, responsive }) => ({
  card: css`
    cursor: pointer;

    padding: 24px;

    background: ${token.colorFillTertiary};
    border: 1px solid ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusLG}px;

    &:hover {
      background: ${token.colorFillSecondary};
      border: 1px solid ${token.colorFill};
    }

    ${responsive.mobile} {
      padding: 16px;
    }
  `,
  container: css`
    ${responsive.mobile} {
      padding-inline: 16px;
    }
  `,
}));

const AboutList = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');

  const items = [
    {
      icon: Home,
      label: t('officialSite'),
      onClick: () => window.open('https://lobehub.com', '__blank'),
      value: 'officialSite',
    },

    {
      icon: Book,
      label: t('document'),
      onClick: () => window.open(FEEDBACK, '__blank'),
      value: 'feedback',
    },
    {
      icon: Rss,
      label: t('blog'),
      onClick: () => window.open('https://lobehub.com/blog', '__blank'),
      value: 'blog',
    },
    {
      icon: Github,
      label: 'GitHub',
      onClick: () => window.open(GITHUB, '__blank'),
      value: 'feedback',
    },
    {
      icon: Feather,
      label: t('feedback'),
      onClick: () => window.open(FEEDBACK, '__blank'),
      value: 'feedback',
    },
    {
      icon: FileClock,
      label: t('changelog'),
      onClick: () => window.open(CHANGELOG, '__blank'),
      value: 'changelog',
    },
    {
      icon: HeartHandshake,
      label: t('terms'),
      onClick: () => window.open(TERMS_URL, '__blank'),
      value: 'terms',
    },
    {
      icon: Lock,
      label: t('privacy'),
      onClick: () => window.open(PRIVACY_URL, '__blank'),
      value: 'privacy',
    },
    {
      icon: Heart,
      label: t('about'),
      onClick: () => window.open(ABOUT, '__blank'),
      value: 'about',
    },
  ];

  return (
    <Grid className={styles.container} maxItemWidth={144} width={'100%'}>
      {items.map(({ value, icon, label, onClick }) => (
        <Flexbox className={styles.card} gap={8} horizontal key={value} onClick={onClick}>
          <Icon icon={icon} size={{ fontSize: 20 }} />
          {label}
        </Flexbox>
      ))}
    </Grid>
  );
});

export default AboutList;
