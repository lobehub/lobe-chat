'use client';

import { useDebounceFn } from 'ahooks';
import { useTheme } from 'antd-style';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

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
  const [localDescription, setLocalDescription] = useState(meta.description || '');

  // Sync local state when meta changes from external source
  useEffect(() => {
    setLocalTitle(meta.title || '');
    setLocalDescription(meta.description || '');
  }, [meta.title, meta.description]);

  // Debounced save for title
  const { run: debouncedSaveTitle } = useDebounceFn(
    (value: string) => {
      updateMeta({ title: value });
    },
    { wait: SAVE_DEBOUNCE_TIME },
  );

  // Debounced save for description
  const { run: debouncedSaveDescription } = useDebounceFn(
    (value: string) => {
      updateMeta({ description: value });
    },
    { wait: SAVE_DEBOUNCE_TIME },
  );

  // Handle avatar change (immediate save)
  const handleAvatarChange = (emoji: string) => {
    updateMeta({ avatar: emoji });
  };

  return (
    <Flexbox
      align="center"
      direction="horizontal"
      gap={16}
      padding={24}
      style={{
        borderBottom: `1px solid ${theme.colorBorderSecondary}`,
      }}
    >
      {/* Avatar (Left) */}
      <Flexbox flex="none">
        <EmojiPicker
          background={backgroundColor}
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

      {/* Name and Description (Right) */}
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

        {/* Description Input */}
        <input
          onChange={(e) => {
            setLocalDescription(e.target.value);
            debouncedSaveDescription(e.target.value);
          }}
          placeholder={t('settingAgent.description.placeholder', { ns: 'setting' })}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.colorTextSecondary,
            fontSize: 14,
            lineHeight: 1.5,
            outline: 'none',
            width: '100%',
          }}
          value={localDescription}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default AgentHeader;
