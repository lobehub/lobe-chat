'use client';

import { Button } from '@lobehub/ui/base-ui';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { lambdaClient } from '@/libs/trpc/client';

import { createOAuthAppModal } from './CreateAppModal';

const CreateAppButton = () => {
  const { t } = useTranslation('auth');
  const { allowed: hasEditPermission, reason } = usePermission('create_content');
  const activeWorkspaceId = useActiveWorkspaceId();
  // Workspace OAuth apps are shared admin config — Admin-or-higher, matching
  // the server's `requireWorkspaceRoleWhenScoped('admin')` gate.
  const { allowed: canManageWorkspaceApps } = usePermission('manage_settings');
  const canEdit = hasEditPermission && (!activeWorkspaceId || canManageWorkspaceApps);
  const navigate = useWorkspaceAwareNavigate();

  const handleCreate = () => {
    if (!canEdit) return;
    createOAuthAppModal({
      onSubmit: async (values) => {
        // The secret is generated on demand on the app page, not at creation.
        const created = await lambdaClient.oauthApp.create.mutate({
          ...values,
          issueSecret: false,
        });
        navigate(`/settings/oauth-apps/${created.id}`);
      },
    });
  };

  return (
    <Button disabled={!canEdit} title={reason} type={'primary'} onClick={handleCreate}>
      {t('oauthApp.list.actions.create')}
    </Button>
  );
};

export default CreateAppButton;
