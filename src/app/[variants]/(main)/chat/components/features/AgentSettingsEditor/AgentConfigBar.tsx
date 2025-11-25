'use client';

import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Settings } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ModelSelect from '@/features/ModelSelect';

import { useStore } from '@/features/AgentSetting/store';

interface AgentConfigBarProps {
  onOpenSettings: () => void;
}

/**
 * AgentConfigBar
 *
 * Primary configuration area featuring:
 * - Model selector (visual focus)
 * - Settings button (opens legacy AgentSettings drawer)
 */
const AgentConfigBar = memo<AgentConfigBarProps>(({ onOpenSettings }) => {
  const { t } = useTranslation('setting');
  const theme = useTheme();

  const config = useStore((s) => s.config);
  const [modelValue, setModelValue] = useState({
    model: config.model,
    provider: config.provider,
  });
  const updateConfig = useStore((s) => s.setAgentConfig);
  const handleModelChange = useMemo(()=>{
    return ({ model, provider }: { model: string; provider: string }) => {
      setModelValue({ model, provider });
      updateConfig({ model, provider });
    }
  },[])

  return (
    <Flexbox
      align="center"
      direction="horizontal"
      gap={12}
      paddingBlock={16}
      paddingInline={24}
      style={{
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
      }}
    >
      {/* Label */}
      <Flexbox
        flex="none"
        style={{
          color: theme.colorTextSecondary,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {t('settingModel.model.title')}
      </Flexbox>

      {/* Model Selector */}
      <Flexbox flex={1} style={{ maxWidth: 400 }}>
        <ModelSelect
          onChange={handleModelChange}
          value={modelValue}
        />
      </Flexbox>

      {/* Settings Button - Opens Legacy AgentSettings Drawer */}
      <ActionIcon icon={Settings} onClick={onOpenSettings} title="Advanced Settings" />
    </Flexbox>
  );
});

export default AgentConfigBar;
