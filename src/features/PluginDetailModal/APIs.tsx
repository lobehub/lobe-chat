import { Empty, Table } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const APIs = memo<{
  id: string;
}>(({ id }) => {
  const { t } = useTranslation('plugin');
  const pluginManifest = useToolStore(pluginSelectors.getPluginManifestById(id), isEqual);

  if (!pluginManifest?.api) return <Empty />;

  return (
    <Flexbox paddingBlock={16} width={'100%'}>
      <Table
        bordered
        columns={[
          {
            dataIndex: 'name',
            render: (name: string) => <code>{name}</code>,
            title: t('detailModal.info.name'),
          },
          {
            dataIndex: 'description',
            title: t('detailModal.info.description'),
          },
        ]}
        dataSource={pluginManifest.api}
        pagination={false}
        rowKey={'name'}
        size={'small'}
        tableLayout="fixed"
      />
    </Flexbox>
  );
});

export default APIs;
