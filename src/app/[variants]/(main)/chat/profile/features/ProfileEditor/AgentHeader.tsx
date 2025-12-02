'use client';

import { EmojiPicker, Icon, Input, Tooltip } from '@lobehub/ui';
import { useDebounceFn } from 'ahooks';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { PaletteIcon } from 'lucide-react';
import { Suspense, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BackgroundSwatches from '@/features/AgentSetting/AgentMeta/BackgroundSwatches';
import { useStore } from '@/features/AgentSetting/store';
import { useGlobalStore } from '@/store/global';
import { globalGeneralSelectors } from '@/store/global/selectors';

const SAVE_DEBOUNCE_TIME = 500; // ms

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
    <Flexbox gap={16} paddingBlock={16}>
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
              <Flexbox padding={8} width={332}>
                <Suspense
                  fallback={
                    <Flexbox gap={8}>
                      <Skeleton.Button block style={{ height: 38 }} />
                      <Skeleton.Button block style={{ height: 38 }} />
                    </Flexbox>
                  }
                >
                  <BackgroundSwatches
                    gap={8}
                    onChange={handleBackgroundColorChange}
                    shape={'square'}
                    size={38}
                    value={backgroundColor}
                  />
                </Suspense>
              </Flexbox>
            ),
            value: 'background',
          },
        ]}
        locale={locale}
        onChange={handleAvatarChange}
        popupProps={{
          placement: 'bottomLeft',
        }}
        shape={'square'}
        size={72}
        value={meta.avatar}
      />
      <Input
        onChange={(e) => {
          setLocalTitle(e.target.value);
          debouncedSaveTitle(e.target.value);
        }}
        placeholder={t('settingAgent.name.placeholder', { ns: 'setting' })}
        style={{
          fontSize: 36,
          fontWeight: 600,
          padding: 0,
          width: '100%',
        }}
        value={localTitle}
        variant={'borderless'}
      />
    </Flexbox>
  );
});

export default AgentHeader;
