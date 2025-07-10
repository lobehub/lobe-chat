'use client';

import { useQueryState } from 'nuqs';
import { memo } from 'react';

import { AgentCategory } from '@/features/AgentSetting';
import { ChatSettingsTabs } from '@/store/global/initialState';

const Menu = memo(() => {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: ChatSettingsTabs.Prompt,
  });

  return <AgentCategory setTab={setTab} tab={tab} />;
});

export default Menu;
