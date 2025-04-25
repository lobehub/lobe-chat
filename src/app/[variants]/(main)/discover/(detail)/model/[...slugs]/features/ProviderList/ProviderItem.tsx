import { ModelTag, ProviderCombine } from '@lobehub/icons';
import { ActionIcon, Grid, Icon, Tag, Tooltip } from '@lobehub/ui';
import { useResponsive, useTheme } from 'antd-style';
import { BadgeCheck, BookIcon, ChevronRightIcon, KeyIcon } from 'lucide-react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { BASE_PROVIDER_DOC_URL } from '@/const/url';
import { DiscoverProviderItem } from '@/types/discover';
import { formatPriceByCurrency, formatTokenNumber } from '@/utils/format';

import Statistic, { type StatisticProps } from '../../../../../components/Statistic';

interface ProviderItemProps extends DiscoverProviderItem {
  mobile?: boolean;
  modelId: string;
}

const ProviderItem = memo<ProviderItemProps>(({ mobile, modelId, identifier }) => {
  const { t } = useTranslation('discover');
  const { xl = true } = useResponsive();
  const theme = useTheme();
  const isLobeHub = identifier === 'lobehub';

  const isMobile = mobile || !xl;

  const model = useMemo(() => {
    const prividerItem = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === identifier);
    if (!prividerItem) return;
    return prividerItem.chatModels.find((m) => m.id.toLowerCase().includes(modelId.toLowerCase()));
  }, [identifier, modelId]);

  const items: StatisticProps[] = [
    {
      title: t('models.contentLength'),
      value: model?.contextWindowTokens ? formatTokenNumber(model.contextWindowTokens) : '--',
    },
    {
      title: t('models.providerInfo.maxOutput'),
      tooltip: t('models.providerInfo.maxOutputTooltip'),
      value: model?.maxOutput ? formatTokenNumber(model.maxOutput) : '--',
    },
    {
      title: t('models.providerInfo.input'),
      tooltip: t('models.providerInfo.inputTooltip'),
      value: model?.pricing?.input
        ? '$' + formatPriceByCurrency(model.pricing.input, model.pricing?.currency)
        : '--',
    },
    {
      title: t('models.providerInfo.output'),
      tooltip: t('models.providerInfo.outputTooltip'),
      value: model?.pricing?.output
        ? '$' + formatPriceByCurrency(model.pricing.output, model.pricing?.currency)
        : '--',
    },
    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */
  ];

  const header = (
    <Flexbox gap={4} style={{ minWidth: 240 }}>
      <Link href={urlJoin('/discover/provider', identifier)} style={{ color: 'inherit' }}>
        <ProviderCombine provider={identifier} size={24} />
      </Link>
      <Flexbox align={'center'} gap={6} horizontal wrap={'wrap'}>
        <ModelTag model={modelId} style={{ background: theme.colorFillQuaternary, margin: 0 }} />
        {isLobeHub && (
          <Tooltip title={t('models.providerInfo.officialTooltip')}>
            <Tag color={'success'} icon={<Icon icon={BadgeCheck} />} />
          </Tooltip>
        )}
        {!isLobeHub && (
          <Tooltip title={t('models.providerInfo.apiTooltip')}>
            <Tag icon={<Icon icon={KeyIcon} />} />
          </Tooltip>
        )}
        <Tooltip title={t('models.guide')}>
          <Link href={urlJoin(BASE_PROVIDER_DOC_URL, identifier)} target={'_blank'}>
            <Tag icon={<Icon icon={BookIcon} />} />
          </Link>
        </Tooltip>
      </Flexbox>
    </Flexbox>
  );

  const button = (
    <Link href={urlJoin('/discover/provider', identifier)} style={{ color: 'inherit' }}>
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

export default ProviderItem;
