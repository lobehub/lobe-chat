'use client';

import { Icon, Tooltip } from '@lobehub/ui';
import { useDebounceFn } from 'ahooks';
import { useTheme } from 'antd-style';
import { PaletteIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BackgroundSwatches from '@/features/AgentSetting/AgentMeta/BackgroundSwatches';
import { useStore } from '@/features/AgentSetting/store';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const EmojiPicker = dynamic(() => import('@lobehub/ui/es/EmojiPicker'), { ssr: false });

const SAVE_DEBOUNCE_TIME = 500; // ms

/**
 * AgentHeader
 *
 * Displays and allows editing of:
 * - Agent avatar (emoji picker)
 * - Agent name (title)
 * - Agent description
 */
const AgentHeader = memo(() => {
  const { t } = useTranslation(['setting', 'common']);
  const theme = useTheme();
  const locale = useGlobalStore(globalGeneralSelectors.currentLanguage);

  // Get current meta from store
  const meta = useStore((s) => s.meta);
  const updateMeta = useStore((s) => s.setAgentMeta);
  const backgroundColor = meta.backgroundColor || theme.colorFillTertiary;

  // Local state for inputs (to avoid stuttering during typing)
  const [localTitle, setLocalTitle] = useState(meta.title || '');

  // Sync local state when meta changes from external source
  useEffect(() => {
    setLocalTitle(meta.title || '');
  }, [meta.title]);

  // Debounced save for title
  const { run: debouncedSaveTitle } = useDebounceFn(
    (value: string) => {
      updateMeta({ title: value });
    },
    { wait: SAVE_DEBOUNCE_TIME },
  );

  // Handle avatar change (immediate save)
  const handleAvatarChange = (emoji: string) => {
    updateMeta({ avatar: emoji });
  };

  // Handle background color change (immediate save)
  const handleBackgroundColorChange = (color?: string) => {
    if (color !== undefined) {
      updateMeta({ backgroundColor: color });
    }
  };

  return (
    <Flexbox
      align="start"
      direction="vertical"
      gap={16}
      padding={24}
      style={{
        paddingBottom: 12,
      }}
    >
      {/* Avatar (Left) */}
      <Flexbox flex="none">
        <EmojiPicker
          background={backgroundColor}
          customTabs={[
            {
              label: (
                <Tooltip title={t('settingAgent.backgroundColor.title', { ns: 'setting' })}>
                  <Icon icon={PaletteIcon} size={{ size: 20, strokeWidth: 2.5 }} />
                </Tooltip>
              ),
              render: () => (
                <Flexbox padding={16}>
                  <BackgroundSwatches
                    onChange={handleBackgroundColorChange}
                    value={backgroundColor}
                  />
                </Flexbox>
              ),
              value: 'background',
            },
          ]}
          locale={locale}
          onChange={handleAvatarChange}
          size={64}
          style={{
            background: backgroundColor,
            borderRadius: 12,
          }}
          value={meta.avatar}
        />
      </Flexbox>

      {/* Name */}
      <Flexbox flex={1} gap={4}>
        {/* Name Input */}
        <input
          onChange={(e) => {
            setLocalTitle(e.target.value);
            debouncedSaveTitle(e.target.value);
          }}
          placeholder={t('settingAgent.name.placeholder', { ns: 'setting' })}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colorText,
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.4,
            outline: 'none',
            width: '100%',
          }}
          value={localTitle}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default AgentHeader;
