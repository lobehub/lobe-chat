import { memo } from 'react';

import PluginSettingsConfig from '@/features/PluginSettings';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const Settings = memo(() => {
  const [identifier] = useToolStore((s) => [s.activePluginIdentifier]);
  const plugin = useToolStore(pluginSelectors.getInstalledPluginById(identifier));
  const { manifest } = plugin || {};

  return (
    manifest?.settings && (
      <PluginSettingsConfig id={manifest.identifier} schema={manifest.settings} />
    )
  );
});

export default Settings;
