import { Button, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import DevModal from 'src/features/PluginDevModal';

import { pluginSelectors, usePluginStore } from '@/store/plugin';

import { useStore } from '../store';

const MarketList = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('plugin');

  const [showModal, setModal] = useState(false);

  const updateConfig = useStore((s) => s.toggleAgentPlugin);
  const [plugins, hasPlugin] = useStore((s) => [s.config.plugins || [], !!s.config.plugins]);

  const [useFetchPluginList, fetchPluginManifest, updateDevPlugin] = usePluginStore((s) => [
    s.useFetchPluginList,
    s.fetchPluginManifest,
    s.updateDevPlugin,
  ]);

  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const devPlugin = usePluginStore(pluginSelectors.getDevPluginById(id), isEqual);

  useFetchPluginList();

  return (
    <>
      <DevModal
        onOpenChange={setModal}
        onSave={(value) => {
          updateDevPlugin(id, value);
        }}
        open={showModal}
        showDelete
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
            updateConfig(id);
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
