import { ActionIcon, Icon, MobileNavBar, MobileNavBarTitle } from '@lobehub/ui';
import { Dropdown, MenuProps } from 'antd';
import { Clock3, MoreHorizontal, Settings, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
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
  const [open, setOpen] = useState(false);

  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentTitle(s),
  ]);

  const [toggleConfig] = useGlobalStore((s) => [s.toggleMobileTopic]);

  const displayTitle = isInbox ? t('inbox.title') : title;

  const items: MenuProps['items'] = [
    {
      icon: <Icon icon={Share2} />,
      key: 'share',
      label: t('share', { ns: 'common' }),
      onClick: () => setOpen(true),
    },
    !isInbox && {
      icon: <Icon icon={Settings} />,
      key: 'settings',
      label: t('header.session', { ns: 'setting' }),
      onClick: () => router.push(pathString('/chat/settings', { hash: location.hash })),
    },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <MobileNavBar
      center={<MobileNavBarTitle title={displayTitle} />}
      onBackClick={() => router.push('/chat')}
      right={
        <>
          <ActionIcon icon={Clock3} onClick={() => toggleConfig()} size={MOBILE_HEADER_ICON_SIZE} />
          <ShareButton mobile open={open} setOpen={setOpen} />
          <Dropdown
            menu={{
              items,
            }}
            trigger={['click']}
          >
            <ActionIcon icon={MoreHorizontal} />
          </Dropdown>
        </>
      }
      showBackButton
    />
  );
});

export default MobileHeader;
