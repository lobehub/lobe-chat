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
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import {
  ABOUT,
  BLOG,
  CHANGELOG,
  FEEDBACK,
  GITHUB,
  OFFICIAL_SITE,
  PRIVACY_URL,
  TERMS_URL,
} from '@/const/url';

const useStyles = createStyles(({ css, token, responsive, isDarkMode }) => ({
  card: css`
    cursor: pointer;

    padding: 20px;

    background: ${isDarkMode ? token.colorFillTertiary : token.colorBgContainer};
    border: 1px solid ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusLG}px;

    &:hover {
      background: ${isDarkMode ? token.colorFillSecondary : token.colorBgContainer};
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
      href: OFFICIAL_SITE,
      icon: Home,
      label: t('officialSite'),
      value: 'officialSite',
    },

    {
      href: FEEDBACK,
      icon: Book,
      label: t('document'),
      value: 'feedback',
    },
    {
      href: BLOG,
      icon: Rss,
      label: t('blog'),
      value: 'blog',
    },
    {
      href: GITHUB,
      icon: Github,
      label: 'GitHub',
      value: 'feedback',
    },
    {
      href: FEEDBACK,
      icon: Feather,
      label: t('feedback'),
      value: 'feedback',
    },
    {
      href: CHANGELOG,
      icon: FileClock,
      label: t('changelog'),
      value: 'changelog',
    },
    {
      href: TERMS_URL,
      icon: HeartHandshake,
      label: t('terms'),
      value: 'terms',
    },
    {
      href: PRIVACY_URL,
      icon: Lock,
      label: t('privacy'),
      value: 'privacy',
    },
    {
      href: ABOUT,
      icon: Heart,
      label: t('about'),
      value: 'about',
    },
  ];

  return (
    <Grid className={styles.container} maxItemWidth={144} width={'100%'}>
      {items.map(({ value, icon, label, href }) => (
        <Link href={href} key={value} style={{ color: 'inherit' }} target={'_blank'}>
          <Flexbox className={styles.card} gap={8} horizontal>
            <Icon icon={icon} size={{ fontSize: 20 }} />
            {label}
          </Flexbox>
        </Link>
      ))}
    </Grid>
  );
});

export default AboutList;
