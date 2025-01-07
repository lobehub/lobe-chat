'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_SITE } from '@/const/url';
import { useShare } from '@/hooks/useShare';

const useStyles = createStyles(
  ({ css, token }) => css`
    position: relative;

    margin-block: 16px 32px;
    padding: 16px;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorFillTertiary};
  `,
);

const ReadDetail = memo<{ desc: string; postId: string; title: string }>(
  ({ postId, title, desc }) => {
    const { t } = useTranslation('changelog');
    const { styles, theme } = useStyles();
    const url = urlJoin(OFFICIAL_SITE, `/changelog/${postId}`);
    const { x, telegram, reddit, mastodon, whatsapp } = useShare({ desc, title, url });

    return (
      <Flexbox align={'center'} className={styles} gap={4} horizontal>
        <Link href={x.link} style={{ color: 'inherit' }} target={'_blank'}>
          <ActionIcon
            fill={theme.colorTextSecondary}
            icon={x.icon}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        </Link>
        <Link href={telegram.link} style={{ color: 'inherit' }} target={'_blank'}>
          <ActionIcon
            fill={theme.colorTextSecondary}
            icon={telegram.icon}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        </Link>
        <Link href={reddit.link} style={{ color: 'inherit' }} target={'_blank'}>
          <ActionIcon
            fill={theme.colorTextSecondary}
            icon={reddit.icon}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        </Link>
        <Link href={mastodon.link} style={{ color: 'inherit' }} target={'_blank'}>
          <ActionIcon
            fill={theme.colorTextSecondary}
            icon={mastodon.icon}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        </Link>
        <Link href={whatsapp.link} style={{ color: 'inherit' }} target={'_blank'}>
          <ActionIcon
            fill={theme.colorTextSecondary}
            icon={whatsapp.icon}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        </Link>
        <Divider style={{ height: '100%' }} type={'vertical'} />
        <Link href={url} style={{ color: 'inherit', flex: 1 }} target={'_blank'}>
          <Flexbox
            align={'center'}
            horizontal
            justify={'space-between'}
            paddingInline={4}
            width={'100%'}
          >
            {t('readDetails')}
            <Icon
              color={theme.colorTextSecondary}
              icon={ChevronRightIcon}
              size={{ fontSize: 20 }}
            />
          </Flexbox>
        </Link>
      </Flexbox>
    );
  },
);

export default ReadDetail;
