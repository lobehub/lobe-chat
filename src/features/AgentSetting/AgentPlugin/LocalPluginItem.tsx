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

  const [useFetchPluginList, fetchPluginManifest, dispatchDevPluginList] = usePluginStore((s) => [
    s.useFetchPluginList,
    s.fetchPluginManifest,
    s.dispatchCustomPluginList,
  ]);

  const pluginManifestLoading = usePluginStore((s) => s.pluginManifestLoading, isEqual);
  const devPlugin = usePluginStore(pluginSelectors.getDevPluginById(id), isEqual);

  useFetchPluginList();

  return (
    <>
      <DevModal
        mode={'edit'}
        onDelete={() => {
          dispatchDevPluginList({ id, type: 'deleteItem' });
        }}
        onOpenChange={setModal}
        onSave={(value) => {
          dispatchDevPluginList({ id, plugin: value, type: 'updateItem' });
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
