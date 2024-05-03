import { ActionIcon } from '@lobehub/ui';
import { AlignJustify } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DESKTOP_HEADER_ICON_SIZE, MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const SettingButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const { t } = useTranslation('common');
  const router = useQueryRoute();

  return (
    <ActionIcon
      icon={AlignJustify}
      onClick={() => {
        if (isInbox) {
          useGlobalStore.setState({
            sidebarKey: SidebarTabKey.Setting,
          });
          router.push('/settings/agent');
        } else {
          router.push('/chat/settings');
        }
      }}
      size={mobile ? MOBILE_HEADER_ICON_SIZE : DESKTOP_HEADER_ICON_SIZE}
      title={t('header.session', { ns: 'setting' })}
    />
  );
});

export default SettingButton;
