import { ReactNode, memo } from 'react';

import { GroupSettingsTabs } from '@/store/global/initialState';

import ChatGroupMeta from './ChatGroupMeta';
import ChatGroupSettings from './ChatGroupSettings';
import GroupMembersConfig from './GroupMembers';

export interface GroupSettingsContentProps {
  loadingSkeleton?: ReactNode;
  tab: GroupSettingsTabs;
}

const GroupSettingsContent = memo<GroupSettingsContentProps>(({ tab }) => {
  return (
    <>
      {tab === GroupSettingsTabs.Settings && <ChatGroupMeta />}
      {tab === GroupSettingsTabs.Members && <GroupMembersConfig />}
      {tab === GroupSettingsTabs.Chat && <ChatGroupSettings />}
    </>
  );
});

export default GroupSettingsContent;
