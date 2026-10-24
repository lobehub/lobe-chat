import { Flexbox, Segmented } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useActiveRouteParams } from '@/hooks/useActiveRouteParams';

import { groupChannelPath } from '../paths';
import { type GroupSidebarTab, useGroupSidebarTab } from './useGroupSidebarTab';

/** Switches an Agent group's sidebar between its group conversation and its Channels. */
const GroupSidebarTabs = () => {
  const { t } = useTranslation('channel');
  const { gid } = useActiveRouteParams();
  const navigate = useWorkspaceAwareNavigate();
  const tab = useGroupSidebarTab();
  if (!gid) return null;

  return (
    <Flexbox paddingBlock={4} paddingInline={8}>
      <Segmented
        block
        size="small"
        value={tab}
        options={[
          { label: t('tabs.group'), value: 'group' },
          { label: t('tabs.channel'), value: 'channel' },
        ]}
        onChange={(value) => {
          if (value === tab) return;
          navigate(
            (value as GroupSidebarTab) === 'channel' ? groupChannelPath(gid) : `/group/${gid}`,
          );
        }}
      />
    </Flexbox>
  );
};

export default GroupSidebarTabs;
