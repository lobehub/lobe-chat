import { Block, Highlighter, Tag } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import InlineTable from '@/components/InlineTable';

import { useDetailContext } from '../DetailProvider';
import { useStyles } from './style';
import { ModeType } from './types';

const Resources = memo<{ mode?: ModeType }>(({ mode }) => {
  const { t } = useTranslation('discover');
  const { resources } = useDetailContext();
  const { styles, theme } = useStyles();

  if (!resources)
    return (
      <Block variant={'outlined'}>
        <Empty
          description={t('mcp.details.schema.resources.empty')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Block>
    );

  return mode === ModeType.Docs ? (
    <Block style={{ overflow: 'hidden' }} variant={'outlined'}>
      <InlineTable
        columns={[
          {
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
              <span className={styles.code} style={{ color: theme.gold }}>
                {text}
              </span>
            ),
            title: t('mcp.details.schema.resources.table.name'),
          },
          {
            dataIndex: 'mimeType',
            key: 'mimeType',
            render: (_, record) => <Tag className={styles.code}>{record.mimeType}</Tag>,
            title: t('mcp.details.schema.resources.table.mineType'),
          },
          {
            dataIndex: 'uri',
            key: 'uri',
            title: t('mcp.details.schema.resources.table.uri'),
          },
          {
            dataIndex: 'description',
            key: 'description',
            title: t('mcp.details.schema.resources.table.description'),
          },
        ]}
        dataSource={resources}
        pagination={false}
        size={'middle'}
      />
    </Block>
  ) : (
    <Highlighter language={'json'} style={{ fontSize: 12 }} variant={'outlined'}>
      {JSON.stringify(resources, null, 2)}
    </Highlighter>
  );
});

export default Resources;
