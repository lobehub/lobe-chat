'use client';

import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import Hero from './components/Hero';
import LabCard from './components/LabCard';

const LabsPage = memo(() => {
  const { t } = useTranslation('labs');

  const [inputMarkdownRender, enableGroupChat, updatePreference] = useUserStore((s) => [
    preferenceSelectors.inputMarkdownRender(s),
    preferenceSelectors.enableGroupChat(s),
    s.updatePreference,
  ]);

  const onToggleMarkdown = useCallback(
    (checked: boolean) => updatePreference({ disableInputMarkdownRender: !checked }),
    [updatePreference],
  );
  const onToggleGroupChat = useCallback(
    (checked: boolean) => updatePreference({ enableGroupChat: checked }),
    [updatePreference],
  );

  return (
    <Flexbox gap={16} padding={8} style={{ alignItems: 'center', width: '100%' }}>
      <Hero />

      <LabCard
        checked={inputMarkdownRender}
        desc={t('features.inputMarkdown.desc')}
        onChange={onToggleMarkdown}
        title={t('features.inputMarkdown.title')}
      />

      <LabCard
        checked={enableGroupChat}
        desc={t('features.groupChat.desc')}
        onChange={onToggleGroupChat}
        title={t('features.groupChat.title')}
      />
    </Flexbox>
  );
});

LabsPage.displayName = 'LabsPage';

export default LabsPage;
