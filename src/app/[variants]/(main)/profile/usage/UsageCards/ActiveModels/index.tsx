'use client';

import { useTheme } from 'antd-style';
import { CSSProperties, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit'
import { ActionIcon, Modal } from '@lobehub/ui'
import { MaximizeIcon } from 'lucide-react'
import { ModelIcon, ProviderIcon } from '@lobehub/icons'

import dayjs from 'dayjs';

import { UsageLog } from '@lobechat/types/src/usage';
import Statistic from '@/components/Statistic';
import StatisticCard from '@/components/StatisticCard';
import TitleWithPercentage from '@/components/StatisticCard/TitleWithPercentage';
import { formatNumber } from '@/utils/format';

import ModelTable from './ModelTable'
import { GroupBy, UsageChartProps } from '../../Client'

const computeList = (data: UsageLog[], groupBy: GroupBy): string[] => {
  if (!data || data.length === 0) return [];

  return Array.from(data.reduce((acc, log) => {
    if (log.requestLogs) {
      for (const item of log.requestLogs) {
        if (groupBy === GroupBy.Model && item.model.length !== 0) {
          acc.add(item.model);
        }
        if (groupBy === GroupBy.Provider && item.provider.length !== 0) {
          acc.add(item.provider);
        }
      }
    }
    return acc
  }, new Set<string>()))
}

const ActiveModels = memo<UsageChartProps>(({ data, isLoading, groupBy }) => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  const [open, setOpen] = useState(false);

  const iconList = computeList(data || [], groupBy || GroupBy.Model);

  return (
    <>
      <StatisticCard
        statistic={
          {
            description: (
              <Flexbox horizontal wrap={'wrap'}>
                {iconList.map((item, i) => {
                  if (iconList[i - 1] && item.slice(0, 3) === iconList[i - 1]?.slice(0, 3)) return null;
                  return (
                    groupBy === GroupBy.Model ?
                      <ModelIcon
                        key={item}
                        model={item}
                        size={18}
                        style={{
                          border: `2px solid ${theme.colorBgContainer}`,
                          boxSizing: 'content-box',
                          marginRight: -8,
                          zIndex: i + 1,
                        }}
                      />
                      :
                      <ProviderIcon
                        key={item}
                        provider={item}
                        size={18}
                        style={{
                          border: `2px solid ${theme.colorBgContainer}`,
                          boxSizing: 'content-box',
                          marginRight: -8,
                          zIndex: i + 1,
                        }}
                      />
                  );
                })}
              </Flexbox>
            ),
            precision: 0,
            value: formatNumber(iconList.length),
          }
        }
        loading={isLoading}
        title={
          <TitleWithPercentage
            title={groupBy === GroupBy.Model ? 'Active Models' : 'Active Providers'}
          />
        }
        extra={
          <ActionIcon
            icon={MaximizeIcon}
            onClick={() => setOpen(true)}
            title={'Model Table'}
          />
        }
      />
      <Modal
        footer={null}
        onCancel={() => setOpen(false)}
        open={open}
        title={'statistics.totalModels'}
      >
        <ModelTable data={data} isLoading={isLoading} groupBy={groupBy} />
      </Modal>
    </>
  );
});

export default ActiveModels;