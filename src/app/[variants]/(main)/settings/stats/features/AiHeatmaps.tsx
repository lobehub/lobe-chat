import { Heatmaps, HeatmapsProps } from '@lobehub/charts';
import { FormGroup, Icon, Tag } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FlameIcon } from 'lucide-react';
import { readableColor } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';

const AiHeatmaps = memo<Omit<HeatmapsProps, 'data'> & { inShare?: boolean; mobile?: boolean }>(
  ({ inShare, mobile, ...rest }) => {
    const { t } = useTranslation('auth');
    const theme = useTheme();
    const { data, isLoading } = useClientDataSWR('stats-heatmaps', async () =>
      messageService.getHeatmaps(),
    );

    const days = data?.filter((item) => item.level > 0).length || '--';
    const hotDays = data?.filter((item) => item.level >= 3).length || '--';

    const content = (
      <Heatmaps
        blockMargin={mobile ? 3 : undefined}
        blockRadius={mobile ? 2 : undefined}
        blockSize={mobile ? 6 : 14}
        data={data || []}
        labels={{
          legend: {
            less: t('heatmaps.legend.less'),
            more: t('heatmaps.legend.more'),
          },
          months: [
            t('heatmaps.months.jan'),
            t('heatmaps.months.feb'),
            t('heatmaps.months.mar'),
            t('heatmaps.months.apr'),
            t('heatmaps.months.may'),
            t('heatmaps.months.jun'),
            t('heatmaps.months.jul'),
            t('heatmaps.months.aug'),
            t('heatmaps.months.sep'),
            t('heatmaps.months.oct'),
            t('heatmaps.months.nov'),
            t('heatmaps.months.dec'),
          ],
          tooltip: t('heatmaps.tooltip'),
          totalCount: t('heatmaps.totalCount'),
        }}
        loading={isLoading || !data}
        maxLevel={4}
        {...rest}
      />
    );

    const fillColor = readableColor(theme.gold);
    const tags = (
      <Flexbox
        gap={4}
        horizontal
        style={{
          alignSelf: 'center',
          flex: 'none',
          zoom: 0.9,
        }}
      >
        <Tag
          bordered={false}
          style={{
            background: theme.colorText,
            color: theme.colorBgLayout,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {[days, t('stats.days')].join(' ')}
        </Tag>
        <Tag
          bordered={false}
          color={'gold'}
          icon={<Icon color={fillColor} fill={fillColor} icon={FlameIcon} />}
          style={{
            background: theme.gold,
            color: fillColor,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {[hotDays, t('stats.days')].join(' ')}
        </Tag>
      </Flexbox>
    );

    if (inShare) {
      return (
        <Flexbox gap={4}>
          <Flexbox align={'baseline'} gap={4} horizontal justify={'space-between'}>
            <div
              style={{
                color: theme.colorTextDescription,
                fontSize: 12,
              }}
            >
              {t('stats.lastYearActivity')}
            </div>
            {tags}
          </Flexbox>
          {content}
        </Flexbox>
      );
    }

    return (
      <FormGroup
        extra={tags}
        style={FORM_STYLE.style}
        title={t('stats.lastYearActivity')}
        variant={'borderless'}
      >
        <Flexbox paddingBlock={24}>{content}</Flexbox>
      </FormGroup>
    );
  },
);

export default AiHeatmaps;
