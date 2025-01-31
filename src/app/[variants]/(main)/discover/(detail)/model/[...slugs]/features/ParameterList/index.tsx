'use client';

import { Collapse, Icon, Tag } from '@lobehub/ui';
import {
  ChartColumnBig,
  Delete,
  FileMinus,
  LucideIcon,
  MessageSquareText,
  Thermometer,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DiscoverModelItem } from '@/types/discover';
import { formatTokenNumber } from '@/utils/format';

import Block from '../../../../features/Block';
import ParameterItem from './ParameterItem';

interface ParameterListProps {
  data: DiscoverModelItem;
  identifier: string;
}

interface Parameter {
  defaultValue: string | number;
  desc: string;
  icon: LucideIcon;
  key: string;
  label: string;
  range?: (string | number)[];
  type: string;
}

const ParameterList = memo<ParameterListProps>(({ data }) => {
  const { t } = useTranslation('discover');

  const items: Parameter[] = [
    {
      defaultValue: 1,
      desc: t('models.parameterList.temperature.desc'),
      icon: Thermometer,
      key: 'temperature',
      label: t('models.parameterList.temperature.title'),
      range: [0, 2],
      type: 'float',
    },
    {
      defaultValue: 1,
      desc: t('models.parameterList.top_p.desc'),
      icon: ChartColumnBig,
      key: 'top_p',
      label: t('models.parameterList.top_p.title'),
      range: [0, 1],
      type: 'float',
    },
    {
      defaultValue: 0,
      desc: t('models.parameterList.presence_penalty.desc'),
      icon: Delete,
      key: 'presence_penalty',
      label: t('models.parameterList.presence_penalty.title'),
      range: [-2, 2],
      type: 'float',
    },
    {
      defaultValue: 0,
      desc: t('models.parameterList.frequency_penalty.desc'),
      icon: FileMinus,
      key: 'frequency_penalty',
      label: t('models.parameterList.frequency_penalty.title'),
      range: [-2, 2],
      type: 'float',
    },
    {
      defaultValue: '--',
      desc: t('models.parameterList.max_tokens.desc'),
      icon: MessageSquareText,
      key: 'max_tokens',
      label: t('models.parameterList.max_tokens.title'),
      range: data?.meta?.maxOutput ? [0, formatTokenNumber(data.meta.maxOutput)] : undefined,
      type: 'int',
    },
  ];

  return (
    <Block title={t('models.parameterList.title')}>
      <Collapse
        defaultActiveKey={items.map((item) => item.key)}
        expandIconPosition={'end'}
        gap={16}
        items={items.map((item) => ({
          children: <ParameterItem {...item} key={item.key} />,
          key: item.key,
          label: (
            <Flexbox align={'center'} gap={8} horizontal>
              <Icon icon={item.icon} size={{ fontSize: 16 }} />
              {item.label}
              <Tag>{item.key}</Tag>
            </Flexbox>
          ),
        }))}
      />
    </Block>
  );
});

export default ParameterList;
