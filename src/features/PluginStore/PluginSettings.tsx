import { ActionIcon } from '@lobehub/ui';
import { Settings2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PluginSettingsModal from '@/features/PluginSettingsModal';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const PluginSettings = memo<{ identifier: string }>(({ identifier }) => {
  const { t } = useTranslation('setting');

  const [open, setOpen] = useState(false);

  const plugin = useToolStore(pluginSelectors.getPluginManifestById(identifier));

  if (!plugin?.settings) return null;

  return (
    <>
      <ActionIcon
        icon={Settings2}
        onClick={() => {
          setOpen(true);
        }}
        title={t('plugin.settings.tooltip')}
      />
      <PluginSettingsModal
        id={identifier}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        schema={plugin.settings}
      />
    </>
  );
});

export default PluginSettings;
