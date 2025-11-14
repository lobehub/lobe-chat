'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { labPreferSelectors, preferenceSelectors } from '@/store/user/selectors';

import Hero from './components/Hero';
import LabCard from './components/LabCard';

interface LabItem {
  checked: boolean;
  cover?: string;
  desc: string;
  key: string;
  title: string;
}

const LabsPage = memo(() => {
  const { t } = useTranslation('labs');

  const [
    isPreferenceInit,
    enableInputMarkdown,
    // enableGroupChat,
    updateLab,
  ] = useUserStore((s) => [
    preferenceSelectors.isPreferenceInit(s),
    labPreferSelectors.enableInputMarkdown(s),
    // labPreferSelectors.enableGroupChat(s),
    s.updateLab,
  ]);

  const labItems: LabItem[] = [
    {
      checked: enableInputMarkdown,
      cover: 'https://github.com/user-attachments/assets/0527a966-3d95-46b4-b880-c0f3fca18f02',
      desc: t('features.inputMarkdown.desc'),
      key: 'enableInputMarkdown',
      title: t('features.inputMarkdown.title'),
    },
    // {
    //   checked: enableGroupChat,
    //   cover: 'https://github.com/user-attachments/assets/72894d24-a96a-4d7c-a823-ff9e6a1a8b6d',
    //   desc: t('features.groupChat.desc'),
    //   key: 'groupChat',
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
          onChange={(checked: boolean) => updateLab({ [item.key]: checked })}
          title={item.title}
        />
      ))}
    </Flexbox>
  );
});

LabsPage.displayName = 'LabsPage';

export default LabsPage;
