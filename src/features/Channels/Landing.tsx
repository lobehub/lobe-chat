import { Button, Center, Empty } from '@lobehub/ui';
import { Hash, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { useWorkspaceAwareNavigate } from '@/features/Workspace/useWorkspaceAwareNavigate';

import { openCreateChannel } from './CreateChannel';
import { groupChannelPath } from './paths';

/** The Channel tab before a Channel is picked from the sidebar. */
export default function ChannelLanding() {
  const { t } = useTranslation('channel');
  const { gid } = useParams<{ gid: string }>();
  const navigate = useWorkspaceAwareNavigate();
  if (!gid) return null;
  return (
    <Center flex={1} height="100%" padding={32}>
      <Empty
        description={t('emptyDescription')}
        icon={Hash}
        title={t('emptyTitle')}
        action={
          <Button
            icon={Plus}
            type="primary"
            onClick={() =>
              openCreateChannel({ onCreated: (id) => navigate(groupChannelPath(gid, id)) })
            }
          >
            {t('create')}
          </Button>
        }
      />
    </Center>
  );
}
