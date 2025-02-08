import {
  Book,
  CircleUserRound,
  Cloudy,
  Database,
  Download,
  Feather,
  FileClockIcon,
  Settings2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { CellProps } from '@/components/Cell';
import { enableAuth } from '@/const/auth';
import { LOBE_CHAT_CLOUD } from '@/const/branding';
import { DOCUMENTS, FEEDBACK, OFFICIAL_URL, UTM_SOURCE } from '@/const/url';
import { isServerMode } from '@/const/version';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { useCategory as useSettingsCategory } from '../../settings/features/useCategory';

export const useCategory = () => {
  const router = useRouter();
  const { canInstall, install } = usePWAInstall();
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const { showCloudPromotion, hideDocs } = useServerConfigStore(featureFlagsSelectors);
  const [isLogin, isLoginWithAuth] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
  ]);

  const profile: CellProps[] = [
    {
      icon: CircleUserRound,
      key: 'profile',
      label: t('userPanel.profile'),
      onClick: () => router.push('/me/profile'),
    },
  ];

  const settings: CellProps[] = [
    {
      icon: Settings2,
      key: 'setting',
      label: t('userPanel.setting'),
      onClick: () => router.push('/me/settings'),
    },
    {
      type: 'divider',
    },
  ];

  const pwa: CellProps[] = [
    {
      icon: Download,
      key: 'pwa',
      label: t('installPWA'),
      onClick: () => install(),
    },
    {
      type: 'divider',
    },
  ];

  const settingsWithoutAuth = [
    ...useSettingsCategory(),
    {
      type: 'divider',
    },
  ];

  /* ↓ cloud slot ↓ */

  /* ↑ cloud slot ↑ */

  const data: CellProps[] = [
    {
      icon: Database,
      key: 'data',
      label: t('userPanel.data'),
      onClick: () => router.push('/me/data'),
    },
    {
      type: 'divider',
    },
  ];

  const helps: CellProps[] = [
    showCloudPromotion && {
      icon: Cloudy,
      key: 'cloud',
      label: t('userPanel.cloud', { name: LOBE_CHAT_CLOUD }),
      onClick: () => window.open(`${OFFICIAL_URL}?utm_source=${UTM_SOURCE}`, '__blank'),
    },
    {
      icon: Book,
      key: 'docs',
      label: t('document'),
      onClick: () => window.open(DOCUMENTS, '__blank'),
    },
    {
      icon: Feather,
      key: 'feedback',
      label: t('feedback'),
      onClick: () => window.open(FEEDBACK, '__blank'),
    },
    {
      icon: FileClockIcon,
      key: 'changelog',
      label: t('changelog'),
      onClick: () => router.push('/changelog'),
    },
  ].filter(Boolean) as CellProps[];

  const mainItems = [
    {
      type: 'divider',
    },
    ...(!enableAuth || (enableAuth && isLoginWithAuth) ? profile : []),
    ...(enableAuth ? (isLoginWithAuth ? settings : []) : settingsWithoutAuth),
    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */
    ...(canInstall ? pwa : []),
    ...(isLogin && !isServerMode ? data : []),
    ...(!hideDocs ? helps : []),
  ].filter(Boolean) as CellProps[];

  return mainItems;
};
