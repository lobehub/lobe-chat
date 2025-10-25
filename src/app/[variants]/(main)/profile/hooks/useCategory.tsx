import { Icon } from '@lobehub/ui';
import { ChartColumnBigIcon, KeyIcon, ShieldCheck, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { MenuProps } from '@/components/Menu';
import { enableAuth } from '@/const/auth';
import { isDeprecatedEdition } from '@/const/version';
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
      label: t('tab.profile'),
    },
    enableAuth &&
      isLoginWithClerk && {
        icon: <Icon icon={ShieldCheck} />,
        key: ProfileTabs.Security,
        label: t('tab.security'),
      },
    !isDeprecatedEdition && {
      icon: <Icon icon={ChartColumnBigIcon} />,
      key: ProfileTabs.Stats,
      label: t('tab.stats'),
      },
    !!showApiKeyManage && {
      icon: <Icon icon={KeyIcon} />,
      key: ProfileTabs.APIKey,
      label: t('tab.apikey'),
    },
  ].filter(Boolean) as MenuProps['items'];

  return cateItems;
};
