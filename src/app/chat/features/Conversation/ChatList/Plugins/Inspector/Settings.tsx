import { ActionIcon } from '@lobehub/ui';
import { LucideSettings } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PluginDetailModal from 'src/features/PluginDetailModal';
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
        <PluginDetailModal
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
