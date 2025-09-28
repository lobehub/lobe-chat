import {
  Book, ChartColumnBigIcon,
  Cloudy,
  Database,
  Download,
  Feather,
  FileClockIcon, LogOut,
  Settings2, ShieldCheck, UserCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { CellProps } from '@/components/Cell';
import { enableAuth } from '@/const/auth';
import { LOBE_CHAT_CLOUD } from '@/const/branding';
import { DOCUMENTS, FEEDBACK, OFFICIAL_URL, UTM_SOURCE } from '@/const/url';
import {isDeprecatedEdition, isServerMode} from '@/const/version';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { useCategory as useSettingsCategory } from '../../settings/features/useCategory';
import {ProfileTabs} from "@/store/global/initialState";

export const useCategory = () => {
  const router = useRouter();
  const { canInstall, install } = usePWAInstall();
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const { showCloudPromotion, hideDocs } = useServerConfigStore(featureFlagsSelectors);
  const [isLogin, isLoginWithAuth, isLoginWithClerk, signOut] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
    authSelectors.isLoginWithClerk(s),
    s.logout
  ]);

  const profile: CellProps[] = [
    {
      icon: UserCircle,
      key: ProfileTabs.Profile,
      label: t('tab.profile', { ns: 'auth' }),
      onClick: () => router.push('/profile'),
    },
    enableAuth &&
    isLoginWithClerk && {
      icon: ShieldCheck,
      key: ProfileTabs.Security,
      label: t('tab.security', { ns: 'auth' }),
      onClick: () => router.push('/profile/security'),
    },
    !isDeprecatedEdition && {
      icon: ChartColumnBigIcon,
      key: ProfileTabs.Stats,
      label: t('tab.stats', { ns: 'auth' }),
      onClick: () => router.push('/profile/stats'),
    },
  ].filter(Boolean) as CellProps[];

  const logout: CellProps[] = [
    {
      type: 'divider',
    },
    {
      icon: LogOut,
      key: 'logout',
      label: t('signout', { ns: 'auth' }),
      onClick: () => {
        signOut();
        router.push('/login');
      },
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
    ...(enableAuth && isLogin ? logout : []),
  ].filter(Boolean) as CellProps[];

  return mainItems;
};
