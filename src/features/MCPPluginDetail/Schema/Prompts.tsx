import { Block, Collapse, Highlighter, Icon, Markdown } from '@lobehub/ui';
import { Empty } from 'antd';
import { CheckIcon, MinusIcon } from 'lucide-react';
import { markdownToTxt } from 'markdown-to-txt';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import InlineTable from '@/components/InlineTable';

import Title from '../../../app/[variants]/(main)/discover/features/Title';
import CollapseDesc from '../CollapseDesc';
import CollapseLayout from '../CollapseLayout';
import { useDetailContext } from '../DetailProvider';
import { useStyles } from './style';
import { ModeType } from './types';

const Prompts = memo<{
  activeKey?: string[];
  mode?: ModeType;
  setActiveKey?: (key: string[]) => void;
}>(({ mode, activeKey = [], setActiveKey }) => {
  const { t } = useTranslation('discover');
  const { prompts } = useDetailContext();
  const { styles, theme } = useStyles();

  if (!prompts)
    return (
      <Block variant={'outlined'}>
        <Empty
          description={t('mcp.details.schema.prompts.empty')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Block>
    );

  return (
    <Collapse
      activeKey={activeKey}
      expandIconPosition={'end'}
      gap={8}
      items={prompts.map((item) => {
        return {
          children: (
            <CollapseLayout
              items={[
                {
                  children: <Markdown>{item.description || ''}</Markdown>,
                  key: 'instructions',
                  title: t('mcp.details.schema.prompts.instructions'),
                },
                {
                  children:
                    mode === ModeType.Docs ? (
                      <InlineTable
                        columns={[
                          {
                            dataIndex: 'name',
                            render: (_, record) => (
                              <span
                                className={styles.code}
                                style={{
                                  color: theme.gold,
                                }}
                              >
                                {record.name}
                              </span>
                            ),
                            title: t('mcp.details.schema.prompts.table.name'),
                          },
                          {
                            dataIndex: 'required',
                            render: (_, record) => (
                              <Icon
                                color={
                                  record.required ? theme.colorSuccess : theme.colorTextDescription
                                }
                                icon={record.required ? CheckIcon : MinusIcon}
                              />
                            ),
                            title: t('mcp.details.schema.prompts.table.required'),
                          },
                          {
                            dataIndex: 'description',
                            title: t('mcp.details.schema.prompts.table.description'),
                          },
                        ]}
                        dataSource={item.arguments}
                        pagination={false}
                        rowKey={'name'}
                      />
                    ) : (
                      <Highlighter
                        language={'json'}
                        style={{ fontSize: 12 }}
                        variant={'borderless'}
                      >
                        {JSON.stringify(item.arguments, null, 2)}
                      </Highlighter>
                    ),
                  key: 'arguments',
                  title: t('mcp.details.schema.prompts.arguments'),
                },
              ]}
            />
          ),
          desc: item.description && (
            <CollapseDesc hide={activeKey.includes(item.name)}>
              {markdownToTxt(item.description)}
            </CollapseDesc>
          ),
          key: item.name,
          label: (
            <Title id={`prompts-${item.name}`} level={3}>
              {item.name}
            </Title>
          ),
        };
      })}
      onChange={setActiveKey}
      variant={'outlined'}
    />
  );
});

export default Prompts;
