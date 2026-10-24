import { Flexbox } from '@lobehub/ui';
import { Plus, SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { useActiveRouteParams } from '@/hooks/useActiveRouteParams';
import { useGlobalStore } from '@/store/global';

import { openCreateChannel } from '../CreateChannel';
import { groupChannelPath } from '../paths';

/** The Channel tab's counterpart of the group tab's "new topic / search" rows. */
const ChannelNav = () => {
  const { t } = useTranslation(['channel', 'chat']);
  const { gid } = useActiveRouteParams();
  const navigate = useWorkspaceAwareNavigate();
  const toggleCommandMenu = useGlobalStore((s) => s.toggleCommandMenu);

  return (
    <Flexbox gap={1} paddingInline={4}>
      <NavItem
        icon={Plus}
        title={t('create')}
        onClick={() =>
          openCreateChannel({
            onCreated: (id) => gid && navigate(groupChannelPath(gid, id)),
          })
        }
      />
      <NavItem
        icon={SearchIcon}
        title={t('tab.search', { ns: 'chat' })}
        onClick={() => toggleCommandMenu(true)}
      />
    </Flexbox>
  );
};

export default ChannelNav;
