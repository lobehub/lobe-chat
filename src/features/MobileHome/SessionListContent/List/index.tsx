import { AGENT_CHAT_URL, GROUP_CHAT_URL } from '@lobechat/const';
import { type SidebarAgentItem } from '@lobechat/types';
import { createStaticStyles } from '@lobehub/ui';
import LazyLoad from 'react-lazy-load';

import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import { useHomeStore } from '@/store/home';
import { homeAgentListSelectors } from '@/store/home/selectors';

import SkeletonList from '../../SkeletonList';
import AddButton from './AddButton';
import AgentItem from './Item';

const styles = createStaticStyles(
  ({ css }) => css`
    min-height: 70px;
  `,
);

interface AgentListProps {
  dataSource: SidebarAgentItem[];
  groupId?: string | null;
  showAddButton?: boolean;
  visibility?: 'private' | 'public';
}
const AgentList = ({ dataSource, groupId, visibility, showAddButton = true }: AgentListProps) => {
  const isInit = useHomeStore(homeAgentListSelectors.isAgentListInit);
  if (!isInit) return <SkeletonList />;
  return dataSource.length
    ? dataSource.map((item) => (
        <LazyLoad className={styles} key={item.id}>
          <WorkspaceLink
            aria-label={item.id}
            key={item.id}
            to={item.type === 'group' ? GROUP_CHAT_URL(item.id) : AGENT_CHAT_URL(item.id, true)}
          >
            <AgentItem groupId={groupId} item={item} />
          </WorkspaceLink>
        </LazyLoad>
      ))
    : showAddButton && <AddButton groupId={groupId ?? undefined} visibility={visibility} />;
};

export default AgentList;
