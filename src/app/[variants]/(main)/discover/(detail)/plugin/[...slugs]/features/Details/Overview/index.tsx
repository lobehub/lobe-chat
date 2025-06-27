import { Collapse } from '@lobehub/ui';
import { isString } from 'lodash-es';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Block from '@/features/MCPPluginDetail/Schema/Block';
import { ModeType } from '@/features/MCPPluginDetail/Schema/types';

import { useDetailContext } from '../../DetailProvider';
import TagList from './TagList';
import Tools from './Tools';

const Overview = memo(() => {
  const { t } = useTranslation('discover');
  const { description, tags, manifest } = useDetailContext();
  const [toolsActiveKey, setToolsActiveKey] = useState<string[]>(
    isString(manifest) ? [] : manifest?.api?.map((item) => item.name) || [],
  );
  const [toolsMode, setToolsMode] = useState<ModeType>(ModeType.Docs);
  const toolsCount = isString(manifest) ? 0 : manifest?.api?.length || 0;

  return (
    <Flexbox gap={16}>
      <Collapse
        defaultActiveKey={['summary']}
        expandIconPosition={'end'}
        items={[
          {
            children: description,
            key: 'summary',
            label: t('plugins.details.summary.title'),
          },
        ]}
        variant={'outlined'}
      />
      <Block
        count={toolsCount || 0}
        desc={t('mcp.details.schema.tools.desc')}
        id={'tools'}
        mode={toolsMode}
        setMode={setToolsMode}
        title={t('mcp.details.schema.tools.title')}
      >
        <Tools activeKey={toolsActiveKey} mode={toolsMode} setActiveKey={setToolsActiveKey} />
      </Block>
      {tags && <TagList tags={tags} />}
    </Flexbox>
  );
});

export default Overview;
