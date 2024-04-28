import { ActionIcon } from '@lobehub/ui';
import { AlignJustify } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserStore } from '@/store/user';
import { SidebarTabKey } from '@/store/user/initialState';
import { pathString } from '@/utils/url';

const SettingButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <ActionIcon
      icon={AlignJustify}
      onClick={() => {
        if (isInbox) {
          useUserStore.setState({
            sidebarKey: SidebarTabKey.Setting,
          });
          router.push('/settings/agent');
        } else {
          router.push(pathString('/chat/settings', { search: location.search }));
        }
      }}
      size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
      title={t('header.session', { ns: 'setting' })}
    />
  );
});

export default SettingButton;
