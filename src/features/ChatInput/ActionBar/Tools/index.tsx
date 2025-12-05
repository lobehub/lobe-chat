import { Segmented } from '@lobehub/ui';
import { Blocks } from 'lucide-react';
import { Suspense, memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PluginStore from '@/features/PluginStore';
import { useModelSupportToolUse } from '@/hooks/useModelSupportToolUse';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import {
  featureFlagsSelectors,
  serverConfigSelectors,
  useServerConfigStore,
} from '@/store/serverConfig';

import Action from '../components/Action';
import { useControls } from './useControls';

type TabType = 'all' | 'installed';

const Tools = memo(() => {
  const { t } = useTranslation('setting');
  const [modalOpen, setModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType | null>(null);
  const { marketItems, installedPluginItems } = useControls({
    setModalOpen,
    setUpdating,
  });
  const { enablePlugins } = useServerConfigStore(featureFlagsSelectors);
  const enableKlavis = useServerConfigStore(serverConfigSelectors.enableKlavis);
  const isInitializedRef = useRef(false);

  // Set default tab based on installed plugins (only on first load)
  useEffect(() => {
    if (!isInitializedRef.current && installedPluginItems.length >= 0) {
      isInitializedRef.current = true;
      setActiveTab(installedPluginItems.length > 0 ? 'installed' : 'all');
    }
  }, [installedPluginItems.length]);

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);

  const enableFC = useModelSupportToolUse(model, provider);

  if (!enablePlugins) return null;
  if (!enableFC)
    return <Action disabled icon={Blocks} showTooltip={true} title={t('tools.disabled')} />;

  // Use effective tab for display (default to market while initializing)
  const effectiveTab = activeTab ?? 'all';
  const currentItems = effectiveTab === 'all' ? marketItems : installedPluginItems;

  return (
    <Suspense fallback={<Action disabled icon={Blocks} title={t('tools.title')} />}>
      <Action
        dropdown={{
          maxHeight: 500,
          maxWidth: 480,
          menu: {
            items: [
              {
                key: 'tabs',
                label: (
                  <Segmented
                    block
                    onChange={(v) => setActiveTab(v as TabType)}
                    options={[
                      {
                        label: t('tools.tabs.all', { defaultValue: 'all' }),
                        value: 'all',
                      },
                      {
                        label: t('tools.tabs.installed', { defaultValue: 'Installed' }),
                        value: 'installed',
                      },
                    ]}
                    size="small"
                    value={effectiveTab}
                  />
                ),
                type: 'group',
              },
              ...currentItems,
            ],
          },
          minHeight: enableKlavis ? 500 : undefined,
          minWidth: 320,
        }}
        icon={Blocks}
        loading={updating}
        showTooltip={false}
        title={t('tools.title')}
      />
      <PluginStore open={modalOpen} setOpen={setModalOpen} />
    </Suspense>
  );
});

export default Tools;
