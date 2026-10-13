import { PROJECT_MEMBER_ROLES, type ProjectMemberRole } from '@lobechat/types';
import { Block, CopyButton, Empty, Flexbox } from '@lobehub/ui';
import { Alert, Button, Input, Select, Switch, Text, toast } from '@lobehub/ui/base-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncError from '@/components/AsyncError';
import SkeletonBar from '@/components/Skeleton/Bar';
import { projectReviewService } from '@/services/projectReview';

import { MemberRow, OwnerRow } from './MemberRow';
import { isForbidden, useProjectMembers } from './useProjectReview';

export function MembersSettings({ projectId }: { projectId: string }) {
  const { t } = useTranslation('project');
  const { data, error, mutate } = useProjectMembers(projectId);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectMemberRole>('reviewer');
  const [busyId, setBusyId] = useState<string>();
  const [inviting, setInviting] = useState(false);
  const [lastInvite, setLastInvite] = useState<{ email: string; url: string }>();

  if (isForbidden(error)) return <Empty description={t('review.manageForbidden')} />;

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    try {
      await action();
      await mutate();
    } catch (error) {
      console.error('Failed to update project member', error);
      toast.error(t('review.members.updateError'));
    } finally {
      setBusyId(undefined);
    }
  };

  const invite = async (to: string, inviteRole: ProjectMemberRole) => {
    const result = await projectReviewService.inviteMember(projectId, to, inviteRole);
    setLastInvite({ email: result.member.email, url: result.inviteUrl });
    toast.success(t('review.members.invitedToast', { email: result.member.email }));
  };

  const submit = async () => {
    setInviting(true);
    try {
      await invite(email.trim(), role);
      setEmail('');
      await mutate();
    } catch (error) {
      console.error('Failed to invite project member', error);
      toast.error(t('review.members.inviteError'));
    } finally {
      setInviting(false);
    }
  };

  return (
    <Flexbox gap={20}>
      <Flexbox gap={6}>
        <Text fontSize={16} weight={600}>
          {t('review.members.title')}
        </Text>
        <Text type="secondary">{t('review.members.description')}</Text>
      </Flexbox>
      <Block variant="outlined">
        <form
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px 16px' }}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <Input
            aria-label={t('review.members.email')}
            disabled={inviting}
            placeholder="name@company.com"
            style={{ flex: '1 1 240px', minWidth: 0 }}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Select
            aria-label={t('review.members.role')}
            style={{ width: 140 }}
            value={role}
            options={PROJECT_MEMBER_ROLES.map((item) => ({
              label: t(`review.role.${item}`),
              value: item,
            }))}
            onChange={(value) => value && setRole(value as ProjectMemberRole)}
          />
          <Button
            disabled={!email.includes('@')}
            htmlType="submit"
            loading={inviting}
            type="primary"
          >
            {t('review.members.invite')}
          </Button>
        </form>
        {lastInvite?.url ? (
          <Flexbox paddingBlock={0} paddingInline={16} style={{ paddingBottom: 14 }}>
            <Alert
              showIcon
              title={t('review.members.linkHint', { email: lastInvite.email })}
              type="info"
              description={
                <Flexbox horizontal align="center" gap={8}>
                  <Text code ellipsis style={{ flex: 1, minWidth: 0 }}>
                    {lastInvite.url}
                  </Text>
                  <CopyButton content={lastInvite.url} size="small" />
                </Flexbox>
              }
            />
          </Flexbox>
        ) : null}
        {error ? (
          <Flexbox padding={16}>
            <AsyncError error={error} onRetry={() => mutate()} />
          </Flexbox>
        ) : !data ? (
          <Flexbox padding={16}>
            <SkeletonBar height={120} />
          </Flexbox>
        ) : (
          <>
            {data.owner && <OwnerRow owner={data.owner} />}
            {data.members.map((member) => (
              <MemberRow
                busy={busyId === member.id}
                key={member.id}
                member={member}
                onResend={() => run(member.id, () => invite(member.email, member.role))}
                onRevoke={() => run(member.id, () => projectReviewService.revokeMember(member.id))}
                onRoleChange={(next) =>
                  run(member.id, () => projectReviewService.updateMemberRole(member.id, next))
                }
              />
            ))}
          </>
        )}
      </Block>
      <Block
        horizontal
        align="center"
        gap={16}
        justify="space-between"
        padding={16}
        variant="outlined"
      >
        <Flexbox gap={4}>
          <Text weight={600}>{t('review.members.workspaceTitle')}</Text>
          <Text fontSize={12} type="secondary">
            {t('review.members.workspaceDescription')}
          </Text>
        </Flexbox>
        <Switch
          aria-label={t('review.members.workspaceTitle')}
          checked={data?.reviewWorkspaceMembers ?? true}
          loading={!data || busyId === 'workspace'}
          onChange={(enabled: boolean) =>
            run('workspace', () =>
              projectReviewService.setReviewWorkspaceMembers(projectId, enabled),
            )
          }
        />
      </Block>
    </Flexbox>
  );
}
