import { ActionIcon, MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { Clock3, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

import ShareButton from '../../features/ChatHeader/ShareButton';

const MobileHeader = memo(() => {
  const { t } = useTranslation('chat');
  const router = useRouter();

  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const [toggleConfig] = useGlobalStore((s) => [s.toggleMobileTopic]);

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={displayTitle} />}
      onBackClick={() => router.push('/chat')}
      right={
        <>
          <ShareButton />
          <ActionIcon icon={Clock3} onClick={() => toggleConfig()} size={MOBILE_HEADER_ICON_SIZE} />
          {!isInbox && (
            <ActionIcon
              icon={Settings}
              onClick={() => router.push(pathString('/chat/settings', { hash: location.hash }))}
              size={MOBILE_HEADER_ICON_SIZE}
            />
          )}
        </>
      }
      showBackButton
    />
  );
});

export default MobileHeader;
