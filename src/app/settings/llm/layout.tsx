import { PropsWithChildren } from 'react';

import { SettingsTabs } from '@/store/global/initialState';

import SettingLayout from '../layout.server';

export default ({ children }: PropsWithChildren) => {
  return <SettingLayout activeTab={SettingsTabs.LLM}>{children}</SettingLayout>;
};
