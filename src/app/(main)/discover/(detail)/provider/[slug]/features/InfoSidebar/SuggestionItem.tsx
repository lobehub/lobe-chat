import { ProviderCombine } from '@lobehub/icons';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverProviderItem } from '@/types/discover';

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

    color: ${token.colorText};
  `,
  desc: css`
    margin-block-end: 0 !important;
    color: ${token.colorTextDescription};
  `,
  id: css`
    margin-block-end: 0 !important;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block-end: 0 !important;
    font-size: 16px !important;
    font-weight: 500 !important;
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
  `,
}));

export interface SuggestionItemProps
  extends Omit<DiscoverProviderItem, 'suggestions' | 'socialData'>,
    FlexboxProps {}

const SuggestionItem = memo<SuggestionItemProps>(
  ({ className, meta, identifier, models, ...rest }) => {
    const { title, description } = meta;
    const { t } = useTranslation(['discover', 'providers']);
    const { cx, styles, theme } = useStyles();

    return (
      <Flexbox className={cx(styles.container, className)} gap={12} key={identifier} {...rest}>
        <ProviderCombine provider={identifier} size={24} title={title} />
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
      </Flexbox>
    );
  },
);

export default SuggestionItem;
