import { Segmented } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useServerConfigStore } from '@/store/serverConfig';
import { useToolStore } from '@/store/tool';
import { PluginStoreTabs } from '@/store/tool/slices/store';

import AddPluginButton from './AddPluginButton';
import InstalledPluginList from './InstalledPluginList';
import McpList from './McpList';
import PluginList from './PluginList';
import Search from './Search';

export const Content = memo(() => {
  const { t } = useTranslation('plugin');
  const mobile = useServerConfigStore((s) => s.isMobile);
  const [listType] = useToolStore((s) => [s.listType]);
  const [keywords, setKeywords] = useState<string>();
  return (
    <Flexbox
      gap={8}
      style={{ maxHeight: mobile ? '-webkit-fill-available' : 'inherit' }}
      width={'100%'}
    >
      <Flexbox gap={8} paddingInline={16}>
        <Flexbox gap={8} horizontal>
          <Segmented
            block
            onChange={(v) => {
              useToolStore.setState({ listType: v as PluginStoreTabs });
            }}
            options={[
              { label: t('store.tabs.mcp'), value: PluginStoreTabs.MCP },
              { label: t('store.tabs.old'), value: PluginStoreTabs.Plugin },
              { label: t('store.tabs.installed'), value: PluginStoreTabs.Installed },
            ]}
            style={{ flex: 1 }}
            value={listType}
            variant={'filled'}
          />
          <AddPluginButton />
        </Flexbox>
        <Search keywords={keywords} setKeywords={setKeywords} />
      </Flexbox>
      {listType === PluginStoreTabs.MCP && <McpList keywords={keywords} />}
      {listType === PluginStoreTabs.Plugin && <PluginList keywords={keywords} />}
      {listType === PluginStoreTabs.Installed && <InstalledPluginList keywords={keywords} />}
    </Flexbox>
  );
});

export default Content;
