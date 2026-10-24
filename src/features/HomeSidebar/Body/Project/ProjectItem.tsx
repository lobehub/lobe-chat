'use client';

import type { DropdownItem } from '@lobehub/ui';
import { ActionIcon, Avatar, confirmModal, DropdownMenu, Icon, toast } from '@lobehub/ui';
import { FolderClosedIcon, MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import NavItem from '@/features/NavPanel/components/NavItem';
import { openRenameProjectModal } from '@/features/Projects/RenameProjectModal';
import { useCanManageProject } from '@/features/Projects/useCanManageProject';
import WorkspaceLink from '@/features/Workspace/WorkspaceLink';
import type { ProjectListItem } from '@/store/project';
import { useProjectStore } from '@/store/project';

// `avatar` is an emoji or image URL, not a component: `Icon` would pass it to
// createElement as a tag name and crash the whole page.
export const projectIcon = (project: Pick<ProjectListItem, 'avatar'>) =>
  project.avatar ? <Avatar avatar={project.avatar} shape={'square'} size={18} /> : FolderClosedIcon;

interface ProjectItemProps {
  project: ProjectListItem;
}

const ProjectItem = memo<ProjectItemProps>(({ project }) => {
  const { t } = useTranslation(['project', 'common']);
  const [deleting, setDeleting] = useState(false);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const canManage = useCanManageProject();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success(t('list.deleteSuccess', { name: project.name }));
    } catch (error) {
      console.error('Failed to delete project', error);
      toast.error(t('list.deleteError'));
      setDeleting(false);
    }
  };

  const menuItems: DropdownItem[] = canManage
    ? [
        {
          icon: <Icon icon={PencilIcon} />,
          key: 'rename',
          label: t('rename.action'),
          onClick: () => openRenameProjectModal(project),
        },
        { type: 'divider' },
        {
          danger: true,
          icon: <Icon icon={TrashIcon} />,
          key: 'delete',
          label: t('list.deleteAction'),
          onClick: () =>
            confirmModal({
              cancelText: t('cancel', { ns: 'common' }),
              content: t('list.deleteConfirmDescription', { name: project.name }),
              okButtonProps: { danger: true },
              okText: t('delete', { ns: 'common' }),
              onOk: () => void handleDelete(),
              title: t('list.deleteConfirmTitle'),
            }),
        },
      ]
    : [];

  return (
    <WorkspaceLink to={`/project/${project.slug ?? project.id}`}>
      <NavItem
        contextMenuItems={canManage ? menuItems : undefined}
        disabled={deleting}
        icon={projectIcon(project)}
        title={project.name}
        actions={
          canManage ? (
            <DropdownMenu items={menuItems}>
              <ActionIcon icon={MoreHorizontalIcon} loading={deleting} size={'small'} />
            </DropdownMenu>
          ) : undefined
        }
      />
    </WorkspaceLink>
  );
});

ProjectItem.displayName = 'ProjectItem';

export default ProjectItem;
