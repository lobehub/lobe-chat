'use client';

import { Avatar, Icon, Tag } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { startCase } from 'lodash-es';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import qs from 'query-string';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverPlugintem } from '@/types/discover';

import Back from '../../../features/Back';

export const useStyles = createStyles(({ css, token }) => ({
  tag: css`
    border: none;
    color: ${token.colorTextSecondary};
    background: ${token.colorFillSecondary};
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
  data: DiscoverPlugintem;
  identifier: string;
  mobile?: boolean;
}

const Header = memo<HeaderProps>(({ identifier, data, mobile }) => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('discover');

  return (
    <Flexbox gap={12} width={'100%'}>
      {!mobile && <Back href={'/discover/plugins'} />}
      <Flexbox align={'center'} gap={8} horizontal justify={'space-between'} width={'100%'}>
        <Flexbox align={'center'} gap={16} horizontal justify={'flex-start'}>
          <Avatar
            alt={identifier}
            animation
            avatar={data.meta.avatar}
            background={theme.colorFillTertiary}
            size={48}
            style={{ flex: 'none' }}
          />
          <Flexbox gap={4}>
            <h1 className={styles.title}>{data.meta.title}</h1>
            <Flexbox align={'center'} gap={8} horizontal>
              <Link href={data.homepage} target={'_blank'}>
                @{data.author}
              </Link>
              <time className={styles.time} dateTime={new Date(data.createdAt).toISOString()}>
                {data.createdAt}
              </time>
            </Flexbox>
          </Flexbox>
        </Flexbox>
        {!mobile && (
          <Flexbox align={'center'} gap={4} horizontal justify={'flex-end'}>
            <Link href={'/discover/plugins'}>
              <Button className={styles.tag} shape={'round'} size={'small'}>
                {t('tab.plugins')}
              </Button>
            </Link>
            {data.meta?.category && (
              <>
                <Icon color={theme.colorTextSecondary} icon={ChevronRight} />
                <Link href={urlJoin('/discover/plugins', data.meta?.category || '')}>
                  <Button className={styles.tag} shape={'round'} size={'small'}>
                    {t(`category.plugin.${data.meta?.category}` as any)}
                  </Button>
                </Link>
              </>
            )}
          </Flexbox>
        )}
      </Flexbox>
      <div>{data.meta.description}</div>
      {data.meta.tags && (
        <Flexbox gap={4} horizontal wrap={'wrap'}>
          {data.meta.tags.map((tag) => (
            <Link
              href={qs.stringifyUrl({
                query: { q: tag },
                url: '/discover/search',
              })}
              key={tag}
            >
              <Tag key={tag} style={{ margin: 0 }}>
                {startCase(tag).trim()}
              </Tag>
            </Link>
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Header;
