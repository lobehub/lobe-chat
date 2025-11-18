import { Icon } from '@lobehub/ui';
import { BadgeCentIcon, ChartColumnBigIcon, KeyIcon, ShieldCheck, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { MenuProps } from '@/components/Menu';
import { ProfileTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

export const useCategory = () => {
  const { t } = useTranslation('auth');
  const [isLoginWithClerk] = useUserStore((s) => [authSelectors.isLoginWithClerk(s)]);
  const { showApiKeyManage } = useServerConfigStore(featureFlagsSelectors);

  const cateItems: MenuProps['items'] = [
    {
      icon: <Icon icon={UserCircle} />,
      key: ProfileTabs.Profile,
      label: (
        <Link onClick={(e) => e.preventDefault()} to={'/profile'}>
          {t('tab.profile')}
        </Link>
      ),
    },
    isLoginWithClerk && {
      icon: <Icon icon={ShieldCheck} />,
      key: ProfileTabs.Security,
      label: (
        <Link onClick={(e) => e.preventDefault()} to={'/profile/security'}>
          {t('tab.security')}
        </Link>
      ),
    },
    {
      icon: <Icon icon={ChartColumnBigIcon} />,
      key: ProfileTabs.Stats,
      label: (
        <Link onClick={(e) => e.preventDefault()} to={'/profile/stats'}>
          {t('tab.stats')}
        </Link>
      ),
    },
    !!showApiKeyManage && {
      icon: <Icon icon={KeyIcon} />,
      key: ProfileTabs.APIKey,
      label: (
        <Link onClick={(e) => e.preventDefault()} to={'/profile/apikey'}>
          {t('tab.apikey')}
        </Link>
      ),
    },
    {
      icon: <Icon icon={BadgeCentIcon} />,
      key: ProfileTabs.Usage,
      label: (
        <Link onClick={(e) => e.preventDefault()} to={'/profile/usage'}>
          {t('tab.usage')}
        </Link>
      ),
    },
  ].filter(Boolean) as MenuProps['items'];

  return cateItems;
};
