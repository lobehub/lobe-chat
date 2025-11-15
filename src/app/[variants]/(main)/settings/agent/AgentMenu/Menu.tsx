'use client';

import { memo } from 'react';

import { AgentCategory } from '@/features/AgentSetting';
import { parseAsString, useQueryState } from '@/hooks/useQueryParam';
import { ChatSettingsTabs } from '@/store/global/initialState';

const Menu = memo(() => {
  const [tab, setTab] = useQueryState('tab', parseAsString.withDefault(ChatSettingsTabs.Prompt));

  return <AgentCategory setTab={setTab} tab={tab} />;
});

export default Menu;
