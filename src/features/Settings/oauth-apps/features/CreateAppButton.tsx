'use client';

import { Button } from '@lobehub/ui/base-ui';
import { useTranslation } from 'react-i18next';

import { useActiveWorkspaceId } from '@/business/client/hooks/useActiveWorkspaceId';
import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';
import { usePermission } from '@/hooks/usePermission';
import { lambdaClient } from '@/libs/trpc/client';

import { stashFreshSecret } from '../freshSecret';
import { createOAuthAppModal } from './CreateAppModal';

interface CreateAppButtonProps {
  /**
   * The page header owns the primary action; a second entry (the empty state)
   * renders as a secondary button so the page keeps one dominant control.
   */
  secondary?: boolean;
}

const CreateAppButton = ({ secondary }: CreateAppButtonProps) => {
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
        const created = await lambdaClient.oauthApp.create.mutate(values);

        // Web apps get a confidential secret; the app page renders its
        // plaintext once, inline, instead of a modal over the page.
        if (created.clientSecret) stashFreshSecret(created.id, created.clientSecret);
        navigate(`/settings/oauth-apps/${created.id}`);
      },
    });
  };

  return (
    <Button
      disabled={!canEdit}
      title={reason}
      type={secondary ? 'default' : 'primary'}
      onClick={handleCreate}
    >
      {t('oauthApp.list.actions.create')}
    </Button>
  );
};

export default CreateAppButton;
