'use client';

import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import Hero from './components/Hero';
import LabCard from './components/LabCard';

interface LabItem {
  checked: boolean;
  cover?: string;
  desc: string;
  key: string;
  onChange: (checked: boolean) => void;
  title: string;
}

const LabsPage = memo(() => {
  const { t } = useTranslation('labs');

  const [
    isPreferenceInit,
    inputMarkdownRender,
    // enableGroupChat,
    updatePreference,
  ] = useUserStore((s) => [
    preferenceSelectors.isPreferenceInit(s),
    preferenceSelectors.inputMarkdownRender(s),
    // preferenceSelectors.enableGroupChat(s),
    s.updatePreference,
  ]);

  const onToggleMarkdown = useCallback(
    (checked: boolean) => updatePreference({ disableInputMarkdownRender: !checked }),
    [updatePreference],
  );
  // const onToggleGroupChat = useCallback(
  //   (checked: boolean) => updatePreference({ enableGroupChat: checked }),
  //   [updatePreference],
  // );

  const labItems: LabItem[] = [
    {
      checked: inputMarkdownRender,
      cover: 'https://github.com/user-attachments/assets/0527a966-3d95-46b4-b880-c0f3fca18f02',
      desc: t('features.inputMarkdown.desc'),
      key: 'inputMarkdown',
      onChange: onToggleMarkdown,
      title: t('features.inputMarkdown.title'),
    },
    // {
    //   checked: enableGroupChat,
    //   cover: 'https://github.com/user-attachments/assets/72894d24-a96a-4d7c-a823-ff9e6a1a8b6d',
    //   desc: t('features.groupChat.desc'),
    //   key: 'groupChat',
    //   onChange: onToggleGroupChat,
    //   title: t('features.groupChat.title'),
    // },
  ];

  return (
    <Flexbox gap={16} padding={8} style={{ alignItems: 'center', width: '100%' }}>
      <Hero />

      {labItems.map((item) => (
        <LabCard
          checked={item.checked}
          cover={item.cover}
          desc={item.desc}
          key={item.key}
          loading={!isPreferenceInit}
          onChange={item.onChange}
          title={item.title}
        />
      ))}
    </Flexbox>
  );
});

LabsPage.displayName = 'LabsPage';

export default LabsPage;
