import { PROJECT_MEMBER_ROLES, type ProjectMemberRole } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { ActionIcon, Avatar, Button, confirmModal, Select, Tag, Text } from '@lobehub/ui/base-ui';
import dayjs from 'dayjs';
import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ProjectMemberItem } from '@/services/projectReview';

interface MemberRowProps {
  busy: boolean;
  member: ProjectMemberItem;
  onResend: () => void;
  onRevoke: () => void;
  onRoleChange: (role: ProjectMemberRole) => void;
}

export function OwnerRow({
  owner,
}: {
  owner: { avatar: string | null; email: string | null; name: string | null };
}) {
  const { t } = useTranslation('project');
  const name = owner.name ?? owner.email ?? '';
  return (
    <Flexbox horizontal align="center" gap={12} paddingBlock={12} paddingInline={16}>
      <Avatar avatar={owner.avatar || undefined} size={28} title={name} />
      <Flexbox flex={1} style={{ minWidth: 0 }}>
        <Text ellipsis>
          {name}{' '}
          <Text as="span" fontSize={12} type="secondary">
            · {t('review.members.owner')}
          </Text>
        </Text>
        {owner.email && owner.email !== name ? (
          <Text ellipsis fontSize={12} type="secondary">
            {owner.email}
          </Text>
        ) : null}
      </Flexbox>
      <Text fontSize={13} type="secondary">
        {t('review.members.allAccess')}
      </Text>
    </Flexbox>
  );
}

export function MemberRow({ busy, member, onResend, onRevoke, onRoleChange }: MemberRowProps) {
  const { t } = useTranslation('project');
  const name = member.user?.name ?? member.email;
  const roleLabel = (role: ProjectMemberRole) => t(`review.role.${role}`);
  const confirmRevoke = () =>
    confirmModal({
      cancelText: t('cancel', { ns: 'common' }),
      content: t('review.members.revokeDescription', { name }),
      okButtonProps: { danger: true },
      okText: t('review.members.revoke'),
      onOk: onRevoke,
      title: t('review.members.revokeTitle', { name }),
    });

  if (member.status === 'pending') {
    const days = member.expiresAt ? Math.max(0, dayjs(member.expiresAt).diff(dayjs(), 'day')) : 0;
    return (
      <Flexbox horizontal align="center" gap={12} paddingBlock={12} paddingInline={16} wrap="wrap">
        <Flexbox flex={1} style={{ minWidth: 0 }}>
          <Text ellipsis>{member.email}</Text>
          <Text fontSize={12} type="secondary">
            {roleLabel(member.role)} · {t('review.members.invited', { count: days })}
          </Text>
        </Flexbox>
        <Flexbox horizontal gap={6}>
          <Button disabled={busy} size="small" onClick={onResend}>
            {t('review.members.resend')}
          </Button>
          <Button disabled={busy} size="small" onClick={confirmRevoke}>
            {t('review.members.revokeInvite')}
          </Button>
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox horizontal align="center" gap={12} paddingBlock={12} paddingInline={16}>
      <Avatar avatar={member.user?.avatar || undefined} size={28} title={name} />
      <Flexbox flex={1} style={{ minWidth: 0 }}>
        <Flexbox horizontal align="center" gap={6}>
          <Text ellipsis>{name}</Text>
          {member.guest && <Tag size="small">{t('review.members.guest')}</Tag>}
        </Flexbox>
        {name !== member.email && (
          <Text ellipsis fontSize={12} type="secondary">
            {member.email}
          </Text>
        )}
      </Flexbox>
      <Select
        aria-label={t('review.members.roleOf', { name })}
        disabled={busy}
        options={PROJECT_MEMBER_ROLES.map((role) => ({ label: roleLabel(role), value: role }))}
        style={{ width: 140 }}
        value={member.role}
        onChange={(role) => role && onRoleChange(role as ProjectMemberRole)}
      />
      <ActionIcon
        disabled={busy}
        icon={XIcon}
        size="small"
        title={t('review.members.removeOf', { name })}
        onClick={confirmRevoke}
      />
    </Flexbox>
  );
}
