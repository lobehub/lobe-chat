import { ActionIcon, MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { LayoutList, Settings } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { INBOX_SESSION_ID } from '@/const/session';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const MobileHeader = memo<{ settings?: boolean }>(({ settings = true }) => {
  const { t } = useTranslation('common');

  const [id, title, model] = useSessionStore((s) => [
    s.activeId,
    agentSelectors.currentAgentTitle(s),
    agentSelectors.currentAgentModel(s),
  ]);

  const isInbox = id === INBOX_SESSION_ID;
  const [toggleConfig] = useGlobalStore((s) => [s.toggleMobileTopic]);

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <MobileNavBar
      center={<MobileNavBarTitle desc={model} title={displayTitle} />}
      onBackClick={() => Router.back()}
      right={
        <>
          <ActionIcon icon={LayoutList} onClick={() => toggleConfig()} />
          {settings && (
            <ActionIcon
              icon={Settings}
              onClick={() => {
                Router.push(`/chat/${id}/setting`);
              }}
            />
          )}
        </>
      }
      showBackButton
    />
  );
});

export default MobileHeader;
