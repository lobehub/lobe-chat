import { ModelTag, ProviderCombine } from '@lobehub/icons';
import { Tag } from '@lobehub/ui';
import { Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DiscoverProviderItem } from '@/types/discover';

const Link = dynamic(() => import('next/link'), {
  loading: () => <Skeleton.Button size={'small'} style={{ height: 22 }} />,
  ssr: false,
});

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
  `,
  container: css`
    cursor: pointer;

    position: relative;

    overflow: hidden;

    height: 100%;
    min-height: 162px;

    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillQuaternary : token.colorFillSecondary}
      inset;

    transition: box-shadow 0.2s ${token.motionEaseInOut};

    &:hover {
      box-shadow: 0 0 1px 1px ${isDarkMode ? token.colorFillSecondary : token.colorFill} inset;
    }
  `,
  desc: css`
    min-height: 44px;
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
  time: css`
    color: ${token.colorTextDescription};
  `,
  title: css`
    zoom: 1.2;
    margin-block-end: 0 !important;
    font-size: 18px !important;
    font-weight: bold;
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
  `,
}));

export interface ProviderCardProps extends DiscoverProviderItem, FlexboxProps {
  mobile?: boolean;
}

const ProviderCard = memo<ProviderCardProps>(({ models, className, meta, identifier, ...rest }) => {
  const { description } = meta;
  const { t } = useTranslation(['discover', 'providers']);
  const { cx, styles, theme } = useStyles();

  return (
    <Flexbox className={cx(styles.container, className)} gap={24} {...rest}>
      <Flexbox gap={12} padding={16} width={'100%'}>
        <ProviderCombine
          provider={identifier}
          size={28}
          style={{ color: theme.colorText }}
          title={meta.title}
        />
        <Flexbox gap={8} horizontal style={{ fontSize: 12, marginTop: -8 }}>
          <div style={{ color: theme.colorTextSecondary }}>@{meta.title}</div>
          <div style={{ color: theme.colorTextDescription }}>
            {t('providers.modelCount', { count: models.length })}
          </div>
        </Flexbox>
        {description && (
          <Paragraph className={styles.desc} ellipsis={{ rows: 2 }}>
            {t(`${identifier}.description`, { ns: 'providers' })}
          </Paragraph>
        )}
        <Flexbox gap={6} horizontal style={{ flexWrap: 'wrap' }}>
          {models
            .slice(0, 3)
            .filter(Boolean)
            .map((tag: string) => (
              <Link href={urlJoin('/discover/model', tag)} key={tag}>
                <ModelTag model={tag} style={{ margin: 0 }} />
              </Link>
            ))}
          {models.length > 3 && <Tag>...</Tag>}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default ProviderCard;
