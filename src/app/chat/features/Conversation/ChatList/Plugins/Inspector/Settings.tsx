import { ActionIcon } from '@lobehub/ui';
import { LucideSettings } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PluginSettingsModal from '@/features/PluginSettingsModal';
import { useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const Settings = memo<{ id: string }>(({ id }) => {
  const item = useToolStore(pluginSelectors.getPluginManifestById(id));
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('plugin');
  return (
    item?.settings && (
      <>
        <ActionIcon
          icon={LucideSettings}
          onClick={() => {
            setOpen(true);
          }}
          title={t('setting')}
        />
        <PluginSettingsModal
          id={id}
          onClose={() => {
            setOpen(false);
          }}
          open={open}
          schema={item.settings}
        />
      </>
    )
  );
});

export default Settings;
