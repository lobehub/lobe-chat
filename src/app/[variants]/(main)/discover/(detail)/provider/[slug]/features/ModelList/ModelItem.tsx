import { ModelIcon } from '@lobehub/icons';
import { ActionIcon, Grid } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';
import urlJoin from 'url-join';

import { ModelInfoTags } from '@/components/ModelSelect';
import { DiscoverModelItem } from '@/types/discover';
import { formatPriceByCurrency, formatTokenNumber } from '@/utils/format';

import Statistic, { type StatisticProps } from '../../../../../components/Statistic';

const { Paragraph, Title } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  banner: css`
    opacity: ${isDarkMode ? 0.9 : 0.4};
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
  extends Omit<DiscoverModelItem, 'suggestions' | 'socialData' | 'providers'>,
    FlexboxProps {
  mobile?: boolean;
}

const ModelItem = memo<SuggestionItemProps>(({ mobile, meta, identifier }) => {
  const { title } = meta;
  const { xl = true } = useResponsive();
  const { t } = useTranslation('discover');
  const { styles, theme } = useStyles();

  const isMobile = mobile || !xl;

  const items: StatisticProps[] = [
    {
      title: t('models.contentLength'),
      value: meta?.contextWindowTokens ? formatTokenNumber(meta.contextWindowTokens) : '--',
    },
    {
      title: t('models.providerInfo.maxOutput'),
      tooltip: t('models.providerInfo.maxOutputTooltip'),
      value: meta?.maxOutput ? formatTokenNumber(meta.maxOutput) : '--',
    },
    {
      title: t('models.providerInfo.input'),
      tooltip: t('models.providerInfo.inputTooltip'),
      value: meta?.pricing?.input
        ? '$' + formatPriceByCurrency(meta.pricing.input, meta.pricing?.currency)
        : '--',
    },
    {
      title: t('models.providerInfo.output'),
      tooltip: t('models.providerInfo.outputTooltip'),
      value: meta?.pricing?.output
        ? '$' + formatPriceByCurrency(meta.pricing.output, meta.pricing?.currency)
        : '--',
    },
    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */
  ];

  const header = (
    <Flexbox gap={12}>
      <Link href={urlJoin('/discover/model', identifier)} style={{ color: 'inherit' }}>
        <Flexbox align={'center'} gap={12} horizontal width={'100%'}>
          <ModelIcon model={identifier} size={36} type={'avatar'} />
          <Flexbox style={{ overflow: 'hidden' }}>
            <Title className={styles.title} ellipsis={{ rows: 1, tooltip: title }} level={3}>
              {title}
            </Title>
            <Paragraph className={styles.id} ellipsis={{ rows: 1 }}>
              {identifier}
            </Paragraph>
          </Flexbox>
        </Flexbox>
      </Link>
      <ModelInfoTags directionReverse {...meta} />
    </Flexbox>
  );

  const button = (
    <Link href={urlJoin('/discover/model', identifier)} style={{ color: 'inherit' }}>
      <ActionIcon color={theme.colorTextDescription} icon={ChevronRightIcon} />
    </Link>
  );

  return (
    <Flexbox
      align={'center'}
      gap={16}
      horizontal
      justify={'space-between'}
      padding={16}
      wrap={'wrap'}
    >
      {isMobile && (
        <Flexbox align={'center'} horizontal justify={'space-between'}>
          {header}
          {button}
        </Flexbox>
      )}
      <Grid
        align={'center'}
        flex={1}
        gap={16}
        horizontal
        maxItemWidth={100}
        rows={isMobile ? 2 : items.length + 1}
        style={{ minWidth: 240 }}
      >
        {!isMobile && header}
        {items.map((item, index) => (
          <Statistic
            align={isMobile ? 'flex-start' : 'center'}
            gap={4}
            key={index}
            valuePlacement={'bottom'}
            valueStyle={{ fontSize: 18 }}
            {...item}
          />
        ))}
      </Grid>
      {!isMobile && button}
    </Flexbox>
  );
});

export default ModelItem;
