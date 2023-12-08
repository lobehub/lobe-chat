import { Button, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import DevModal from '@/features/PluginDevModal';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

import { useStore } from '../store';

const MarketList = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('plugin');

  const [showModal, setModal] = useState(false);

  const [toggleAgentPlugin, hasPlugin] = useStore((s) => [s.toggleAgentPlugin, !!s.config.plugins]);
  const plugins = useStore((s) => s.config.plugins || []);

  const [useFetchPluginList, fetchPluginManifest, deleteCustomPlugin, updateCustomPlugin] =
    useToolStore((s) => [
      s.useFetchPluginStore,
      s.installPlugin,
      s.uninstallCustomPlugin,
      s.updateCustomPlugin,
    ]);

  const pluginManifestLoading = useToolStore((s) => s.pluginInstallLoading, isEqual);
  const devPlugin = useToolStore(pluginSelectors.getCustomPluginById(id), isEqual);

  useFetchPluginList();

  return (
    <>
      <DevModal
        mode={'edit'}
        onDelete={() => {
          deleteCustomPlugin(id);
          toggleAgentPlugin(id, false);
        }}
        onOpenChange={setModal}
        onSave={(value) => {
          updateCustomPlugin(id, value);
        }}
        open={showModal}
        value={devPlugin}
      />

      <Flexbox align={'center'} gap={8} horizontal>
        <Switch
          checked={
            // 如果在加载中，说明激活了
            pluginManifestLoading[id] || !hasPlugin ? false : plugins.includes(id)
          }
          loading={pluginManifestLoading[id]}
          onChange={(checked) => {
            toggleAgentPlugin(id);
            if (checked) {
              fetchPluginManifest(id);
            }
          }}
        />
        <Button
          onClick={() => {
            setModal(true);
          }}
        >
          {t('list.item.local.config')}
        </Button>
      </Flexbox>
    </>
  );
});

export default MarketList;
