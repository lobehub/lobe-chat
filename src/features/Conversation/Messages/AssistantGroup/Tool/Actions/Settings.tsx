import { ActionIcon } from '@lobehub/ui';
import { LucideSettings } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const PluginDetailModal = dynamic(() => import('@/features/PluginDetailModal'), { ssr: false });

const Settings = memo<{ id: string }>(({ id }) => {
  const item = useToolStore(pluginSelectors.getToolManifestById(id));
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('plugin');
  const hasSettings = pluginHelpers.isSettingSchemaNonEmpty(item?.settings);
  if (!hasSettings) return;

  return (
    <>
      <ActionIcon
        icon={LucideSettings}
        onClick={() => {
          setOpen(true);
        }}
        size={'small'}
        title={t('setting')}
      />
      <PluginDetailModal
        id={id}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        schema={item?.settings}
      />
    </>
  );
});

export default Settings;
