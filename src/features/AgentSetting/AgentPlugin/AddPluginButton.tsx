import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { LucideBlocks } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/features/AgentSetting/store';
import DevModal from '@/features/PluginDevModal';
import { useToolStore } from '@/store/tool';

const AddPluginButton = forwardRef<HTMLButtonElement>((props, ref) => {
  const { t } = useTranslation('setting');
  const [showModal, setModal] = useState(false);
  const [toggleAgentPlugin] = useStore((s) => [s.toggleAgentPlugin]);
  const [installPlugin, saveToDevList, updateNewDevPlugin] = useToolStore((s) => [
    s.installPlugin,
    s.saveToCustomPluginList,
    s.updateNewCustomPlugin,
  ]);

  const togglePlugin = async (pluginId: string, fetchManifest?: boolean) => {
    toggleAgentPlugin(pluginId);
    if (fetchManifest) {
      await installPlugin(pluginId);
    }
  };

  return (
    <>
      <DevModal
        onOpenChange={setModal}
        onSave={async (devPlugin) => {
          // 先保存
          saveToDevList(devPlugin);
          // 再开启插件
          await togglePlugin(devPlugin.identifier, true);
        }}
        onValueChange={updateNewDevPlugin}
        open={showModal}
      />
      <Button
        icon={<Icon icon={LucideBlocks} />}
        onClick={(e) => {
          e.stopPropagation();
          setModal(true);
        }}
        ref={ref}
        size={'small'}
      >
        {t('plugin.addTooltip')}
      </Button>
    </>
  );
});

export default AddPluginButton;
