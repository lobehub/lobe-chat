'use client';

import { Tabs, Tag } from '@lobehub/ui';
import { Empty, Skeleton, Table } from 'antd';
import { useTheme } from 'antd-style';
import { PuzzleIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverPlugintem } from '@/types/discover';

import HighlightBlock from '../../../features/HighlightBlock';

interface ParameterListProps extends FlexboxProps {
  data?: DiscoverPlugintem;
}

const ParameterList = memo<ParameterListProps>(({ data }) => {
  const { t } = useTranslation('discover');
  const [active, setActive] = useState<number>(0);
  const theme = useTheme();
  if (!data) return <Skeleton active />;

  let content;

  if (!data.manifest?.api) {
    content = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  } else {
    const api = data.manifest?.api;
    const parameters = Object.entries(api[active]?.parameters?.properties || {}).map(
      ([key, value]) => ({
        name: key,
        type: value.type,
      }),
    );

    content = (
      <>
        <Tabs
          activeKey={active as any}
          compact
          items={api.map((item, index) => ({
            key: index as any,
            label: item.name,
          }))}
          onChange={(key) => setActive(key as any)}
        />
        <Flexbox
          padding={16}
          style={{
            border: `1px solid ${theme.colorBorderSecondary}`,
            borderRadius: theme.borderRadiusLG,
          }}
        >
          {api[active].description}
        </Flexbox>
        <Table
          bordered
          columns={[
            {
              dataIndex: 'name',
              render: (name: string) => <code>{name}</code>,
              title: t('plugins.meta.parameter'),
            },
            {
              dataIndex: 'type',
              render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
              title: t('plugins.meta.type'),
            },
          ]}
          dataSource={parameters}
          pagination={false}
          rowKey={'name'}
          tableLayout="fixed"
        />
      </>
    );
  }

  return (
    <HighlightBlock
      avatar={data?.meta?.avatar}
      icon={PuzzleIcon}
      style={{ background: theme.colorBgContainer }}
      title={t('plugins.meta.title')}
    >
      <Flexbox gap={24} padding={16} width={'100%'}>
        {content}
      </Flexbox>
    </HighlightBlock>
  );
});

export default ParameterList;
