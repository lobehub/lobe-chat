import { ProviderCombine } from '@lobehub/icons';
import { ActionIcon, Grid, Icon, Tooltip } from '@lobehub/ui';
import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { BadgeCheck, BookIcon, ChevronRightIcon, KeyIcon } from 'lucide-react';
import Link from 'next/link';
import numeral from 'numeral';
import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import Statistic from '@/app/(main)/discover/features/Statistic';
import { BASE_PROVIDER_DOC_URL } from '@/const/url';
import { formatTokenNumber } from '@/utils/format';

const formatPrice = (price: number) => {
  const [a, b] = price.toFixed(2).split('.');
  return `${numeral(a).format('0,0')}.${b}`;
};

const useStyles = createStyles(({ css, token }) => ({
  tagGreen: css`
    color: ${token.colorSuccess};
    background: ${token.colorSuccessBgHover};
  `,
}));

interface ProviderItemProps {
  id: string;
  input?: number;
  maxOutput?: number;
  output?: number;
  title: ReactNode;
}

const ProviderItem = memo<ProviderItemProps>(({ id, maxOutput, input, output }) => {
  const { t } = useTranslation('discover');
  const { styles, theme } = useStyles();
  const isLobeHub = id === 'lobehub';
  return (
    <Flexbox
      align={'center'}
      gap={16}
      horizontal
      justify={'space-between'}
      padding={16}
      wrap={'wrap'}
    >
      <Flexbox gap={4} style={{ minWidth: 240 }}>
        <Link href={urlJoin('/discover/provider', id)} style={{ color: 'inherit' }}>
          <ProviderCombine provider={id} size={24} />
        </Link>
        <Flexbox align={'center'} gap={6} horizontal>
          {isLobeHub && (
            <Tooltip title={t('models.providerInfo.officialTooltip')}>
              <Tag
                bordered={false}
                className={styles.tagGreen}
                icon={<Icon icon={BadgeCheck} />}
                style={{ margin: 0 }}
              />
            </Tooltip>
          )}

          <Tooltip title={t('models.guide')}>
            <Link href={urlJoin(BASE_PROVIDER_DOC_URL, id)} target={'_blank'}>
              <Tag bordered={false} icon={<Icon icon={BookIcon} />} style={{ margin: 0 }} />
            </Link>
          </Tooltip>

          {!isLobeHub && (
            <Tooltip title={t('models.providerInfo.apiTooltip')}>
              <Tag bordered={false} icon={<Icon icon={KeyIcon} />} style={{ margin: 0 }} />
            </Tooltip>
          )}
        </Flexbox>
      </Flexbox>
      <Grid
        align={'center'}
        flex={1}
        gap={16}
        horizontal
        maxItemWidth={100}
        rows={3}
        style={{ minWidth: 240 }}
      >
        <Statistic
          gap={4}
          title={t('models.providerInfo.maxOutput')}
          tooltip={t('models.providerInfo.maxOutputTooltip')}
          value={maxOutput ? formatTokenNumber(maxOutput) : '--'}
          valuePlacement={'bottom'}
          valueStyle={{ fontSize: 18 }}
        />
        <Statistic
          gap={4}
          title={t('models.providerInfo.input')}
          tooltip={t('models.providerInfo.inputTooltip')}
          value={input ? '$' + formatPrice(input) : '--'}
          valuePlacement={'bottom'}
          valueStyle={{ fontSize: 18 }}
        />
        <Statistic
          gap={4}
          title={t('models.providerInfo.output')}
          tooltip={t('models.providerInfo.outputTooltip')}
          value={output ? '$' + formatPrice(output) : '--'}
          valuePlacement={'bottom'}
          valueStyle={{ fontSize: 18 }}
        />
        {/* ↓ cloud slot ↓ */}
        {/* ↑ cloud slot ↑ */}
      </Grid>
      <Link href={urlJoin('/discover/provider', id)} style={{ color: 'inherit' }}>
        <ActionIcon color={theme.colorTextDescription} icon={ChevronRightIcon} />
      </Link>
    </Flexbox>
  );
});

export default ProviderItem;
