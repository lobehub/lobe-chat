'use client';

import { ProviderCombine } from '@lobehub/icons';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DiscoverProviderItem } from '@/types/discover';

import { useProviderItem } from '../../../../features/useProviderList';
import Back from '../../../features/Back';

export const useStyles = createStyles(({ css, token }) => ({
  tag: css`
    color: ${token.colorTextSecondary};
    background: ${token.colorFillSecondary};
    border: none;
  `,
  time: css`
    font-size: 12px;
    color: ${token.colorTextDescription};
  `,
  title: css`
    margin-block: 0;
    font-size: 18px;
    font-weight: bold;
    line-height: 1.2;
  `,
}));

interface HeaderProps {
  data: DiscoverProviderItem;
  identifier: string;
  mobile?: boolean;
}

const Header = memo<HeaderProps>(({ identifier, data, mobile }) => {
  const provider = useProviderItem(identifier);
  const { styles, theme } = useStyles();
  const { t } = useTranslation('discover');

  return (
    <Flexbox gap={12} width={'100%'}>
      {!mobile && <Back href={'/discover/providers'} />}
      <Flexbox align={'center'} gap={8} horizontal justify={'space-between'} width={'100%'}>
        <Flexbox align={'flex-start'} gap={4} justify={'flex-start'}>
          <ProviderCombine provider={identifier} size={40} />
          <Flexbox align={'center'} gap={12} horizontal style={{ color: theme.colorTextSecondary }}>
            <div>{provider?.name}</div>
            <time className={styles.time} dateTime={new Date(data.createdAt).toISOString()}>
              {data.createdAt}
            </time>
          </Flexbox>
        </Flexbox>
        {!mobile && (
          <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'}>
            <Link href={'/discover/providers'}>
              <Button className={styles.tag} shape={'round'} size={'small'}>
                {t('tab.providers')}
              </Button>
            </Link>
          </Flexbox>
        )}
      </Flexbox>
      <div>{data.meta.description}</div>
    </Flexbox>
  );
});

export default Header;
