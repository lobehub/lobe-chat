import { agentDisplayName } from '@lobechat/types';
import {
  ActionIcon,
  Block,
  Button,
  confirmModal,
  cssVar,
  DropdownMenu,
  Flexbox,
  Icon,
  Switch,
  Tag,
  Text,
  toast,
  Tooltip,
} from '@lobehub/ui';
import { MoreHorizontalIcon, PencilLineIcon, Trash2Icon, UserPlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import { DEFAULT_AVATAR } from '@/const/meta';
import AddAgentMemberModal from '@/features/AddAgentMemberModal';
import type { ProjectDetail } from '@/store/project';
import { useProjectStore } from '@/store/project';

import { openEditMemberModal } from './EditMemberModal';

type ProjectMember = NonNullable<ProjectDetail['agents']>[number];

const rowStyle = (index: number) =>
  index ? { borderTop: `1px solid ${cssVar.colorBorderSecondary}` } : undefined;

export function ProjectMemberSettings({ detail }: { detail: ProjectDetail }) {
  const { t } = useTranslation('project');
  const [inviteOpen, setInviteOpen] = useState(false);
  const addProjectAgents = useProjectStore((s) => s.addProjectAgents);
  const updateProjectAgent = useProjectStore((s) => s.updateProjectAgent);
  const removeProjectAgent = useProjectStore((s) => s.removeProjectAgent);
  const projectId = detail.project.id;
  const canManage = detail.permissions?.canManageMembers ?? false;
  const members = detail.agents ?? [];
  // Other members cannot see a private agent, so a shared project only takes shared ones.
  const isShared = Boolean(detail.project.workspaceId) && detail.project.visibility === 'public';

  const invite = async (agentIds: string[]) => {
    try {
      await addProjectAgents(projectId, agentIds);
      setInviteOpen(false);
      toast.success(t('members.invited', { count: agentIds.length }));
    } catch (error) {
      console.error('Failed to invite project agents', error);
      toast.error(t('members.inviteFailed'));
      throw error;
    }
  };

  const toggle = async (member: ProjectMember, enabled: boolean) => {
    try {
      await updateProjectAgent(projectId, member.agent.id, { enabled });
    } catch (error) {
      console.error('Failed to update project agent', error);
      toast.error(t('members.updateFailed'));
    }
  };

  const remove = (member: ProjectMember) =>
    confirmModal({
      content: t('members.removeConfirmDescription'),
      okButtonProps: { danger: true },
      okText: t('members.remove'),
      onOk: async () => {
        try {
          await removeProjectAgent(projectId, member.agent.id);
        } catch (error) {
          console.error('Failed to remove project agent', error);
          toast.error(t('members.removeFailed'));
        }
      },
      title: t('members.removeConfirmTitle', {
        name: agentDisplayName(member.agent, t('defaultAgent', { ns: 'common' })),
      }),
    });

  const inviteButton = (
    <Button
      disabled={!canManage}
      icon={UserPlusIcon}
      type="primary"
      onClick={() => setInviteOpen(true)}
    >
      {t('members.invite')}
    </Button>
  );

  return (
    <Flexbox gap={20}>
      <Flexbox horizontal align="flex-start" gap={16} justify="space-between">
        <Flexbox gap={6}>
          <Text fontSize={16} weight={600}>
            {t('settings.members')}
          </Text>
          <Text type="secondary">{t('members.description')}</Text>
        </Flexbox>
        {canManage ? (
          inviteButton
        ) : (
          <Tooltip title={t('members.manageForbidden')}>
            <span>{inviteButton}</span>
          </Tooltip>
        )}
      </Flexbox>
      <Block padding={0} variant="outlined">
        {members.map((member, index) => {
          const isCoordinator = member.agent.id === detail.project.coordinatorAgentId;
          const name = agentDisplayName(member.agent, t('defaultAgent', { ns: 'common' }));
          return (
            <Flexbox
              horizontal
              align="center"
              gap={12}
              key={member.agent.id}
              padding={16}
              style={rowStyle(index)}
            >
              <Avatar
                avatar={member.agent.avatar || DEFAULT_AVATAR}
                background={member.agent.backgroundColor ?? undefined}
                size={36}
                title={name}
              />
              <Flexbox flex={1} gap={4} style={{ minWidth: 0 }}>
                <Flexbox horizontal align="center" gap={8}>
                  <Text ellipsis weight={500}>
                    {name}
                  </Text>
                  {isCoordinator ? (
                    <Tag color="primary">{t('directories.coordinator')}</Tag>
                  ) : member.binding.role ? (
                    <Tag>{member.binding.role}</Tag>
                  ) : null}
                </Flexbox>
                <Text ellipsis fontSize={12} type="secondary">
                  {isCoordinator
                    ? t('members.coordinatorResponsibility')
                    : member.binding.responsibility || t('members.noResponsibility')}
                </Text>
              </Flexbox>
              {!isCoordinator && canManage && (
                <>
                  <Switch
                    aria-label={t('members.enabled')}
                    size="small"
                    value={member.binding.enabled}
                    onChange={(enabled) => toggle(member, enabled)}
                  />
                  <DropdownMenu
                    items={[
                      {
                        icon: <Icon icon={PencilLineIcon} />,
                        key: 'edit',
                        label: t('members.edit'),
                        onClick: () =>
                          openEditMemberModal({
                            agentId: member.agent.id,
                            projectId,
                            responsibility: member.binding.responsibility,
                            role: member.binding.role,
                            title: name,
                          }),
                      },
                      {
                        danger: true,
                        icon: <Icon icon={Trash2Icon} />,
                        key: 'remove',
                        label: t('members.remove'),
                        onClick: () => remove(member),
                      },
                    ]}
                  >
                    <ActionIcon icon={MoreHorizontalIcon} size="small" title={t('members.more')} />
                  </DropdownMenu>
                </>
              )}
            </Flexbox>
          );
        })}
        {members.length <= 1 && (
          <Flexbox gap={4} padding={16} style={rowStyle(members.length)}>
            <Text type="secondary">{t('members.empty')}</Text>
          </Flexbox>
        )}
      </Block>
      <AddAgentMemberModal
        existingMembers={members.map((member) => member.agent.id)}
        open={inviteOpen}
        sharedOnly={isShared}
        onCancel={() => setInviteOpen(false)}
        onConfirm={invite}
      />
    </Flexbox>
  );
}
