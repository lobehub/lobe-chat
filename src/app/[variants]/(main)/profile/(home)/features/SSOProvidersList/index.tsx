import { SSOProvider } from '@lobechat/types';
import { ActionIcon } from '@lobehub/ui';
import { Dropdown, type MenuProps, Typography } from 'antd';
import { ArrowRight, Plus, RotateCw, Unlink } from 'lucide-react';
import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { modal, notification } from '@/components/AntdStaticMethods';
import AuthIcons from '@/components/NextAuth/AuthIcons';
import {
  accountInfo,
  linkSocial,
  listAccounts,
  unlinkAccount,
} from '@/libs/better-auth/auth-client';
import { useOnlyFetchOnceSWR } from '@/libs/swr';
import { userService } from '@/services/user';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

const providerNameStyle: CSSProperties = {
  textTransform: 'capitalize',
};

export const SSOProvidersList = memo(() => {
  const userProfile = useUserStore(userProfileSelectors.userProfile);
  const isLoginWithBetterAuth = useUserStore(authSelectors.isLoginWithBetterAuth);
  const oAuthSSOProviders = useServerConfigStore(serverConfigSelectors.oAuthSSOProviders);
  const { t } = useTranslation('auth');

  const { data, isLoading, mutate } = useOnlyFetchOnceSWR(
    'profile-sso-providers',
    async (): Promise<{ hasCredential: boolean; providers: SSOProvider[] }> => {
      if (isLoginWithBetterAuth) {
        // Use better-auth native listAccounts API
        const result = await listAccounts();
        const accounts = result.data || [];
        // Check if user has credential (password) login
        const hasCredential = accounts.some((account) => account.providerId === 'credential');
        // Filter out credential provider and map to SSOProvider format
        const providers = await Promise.all(
          accounts
            .filter((account) => account.providerId !== 'credential')
            .map(async (account) => {
              const info = await accountInfo({
                query: {
                  accountId: account.accountId,
                },
              });

              return {
                email: info.data?.user?.email || '',
                provider: account.providerId,
                providerAccountId: account.accountId,
              };
            }),
        );
        return { hasCredential, providers };
      }

      // Fallback for NextAuth - use tRPC
      const providers = await userService.getUserSSOProviders();
      return { hasCredential: false, providers };
    },
  );

  const providers = data?.providers || [];
  // Allow unlink if user has multiple SSO providers OR has credential login
  const allowUnlink = providers.length > 1 || data?.hasCredential;

  // Get linked provider IDs for filtering
  const linkedProviderIds = useMemo(() => {
    return new Set(providers.map((item) => item.provider));
  }, [providers]);

  // Get available providers for linking (filter out already linked)
  const availableProviders = useMemo(() => {
    return (oAuthSSOProviders || []).filter((provider) => !linkedProviderIds.has(provider));
  }, [oAuthSSOProviders, linkedProviderIds]);

  const handleUnlinkSSO = async (provider: string, providerAccountId: string) => {
    // Prevent unlink if this is the only login method
    if (!allowUnlink) {
      notification.error({
        message: t('profile.sso.unlink.forbidden'),
      });
      return;
    }
    modal.confirm({
      content: t('profile.sso.unlink.description', {
        email: userProfile?.email || 'None',
        provider,
        providerAccountId,
      }),
      okButtonProps: {
        danger: true,
      },
      onOk: async () => {
        if (isLoginWithBetterAuth) {
          // Use better-auth native API
          await unlinkAccount({ providerId: provider });
        } else {
          // Fallback for NextAuth
          await userService.unlinkSSOProvider(provider, providerAccountId);
        }
        mutate();
      },
      title: <span style={providerNameStyle}>{t('profile.sso.unlink.title', { provider })}</span>,
    });
  };

  const handleLinkSSO = async (provider: string) => {
    if (isLoginWithBetterAuth) {
      // Use better-auth native linkSocial API
      await linkSocial({
        callbackURL: '/profile',
        provider: provider as any,
      });
    }
  };

  // Dropdown menu items for linking new providers
  const linkMenuItems: MenuProps['items'] = availableProviders.map((provider) => ({
    icon: AuthIcons(provider, 16),
    key: provider,
    label: <span style={providerNameStyle}>{provider}</span>,
    onClick: () => handleLinkSSO(provider),
  }));

  if (isLoading) {
    return (
      <Flexbox align={'center'} gap={4} horizontal>
        <ActionIcon icon={RotateCw} size={'small'} spin />
        <Typography.Text type="secondary">{t('profile.sso.loading')}</Typography.Text>
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={8}>
      {providers.map((item) => (
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'space-between'}
          key={[item.provider, item.providerAccountId].join('-')}
        >
          <Flexbox align={'center'} gap={6} horizontal style={{ fontSize: 12 }}>
            {AuthIcons(item.provider, 16)}
            <span style={providerNameStyle}>{item.provider}</span>
            {item.email && (
              <Typography.Text style={{ fontSize: 11 }} type="secondary">
                · {item.email}
              </Typography.Text>
            )}
          </Flexbox>
          <ActionIcon
            disabled={!allowUnlink}
            icon={Unlink}
            onClick={() => handleUnlinkSSO(item.provider, item.providerAccountId)}
            size={'small'}
          />
        </Flexbox>
      ))}

      {/* Link Account Button - Only show for Better-Auth users with available providers */}
      {isLoginWithBetterAuth && availableProviders.length > 0 && (
        <Dropdown menu={{ items: linkMenuItems, style: { maxWidth: '200px' } }} trigger={['click']}>
          <Flexbox align={'center'} gap={6} horizontal style={{ cursor: 'pointer', fontSize: 12 }}>
            <Plus size={14} />
            <span>{t('profile.sso.link.button')}</span>
            <ArrowRight size={14} />
          </Flexbox>
        </Dropdown>
      )}
    </Flexbox>
  );
});

export default SSOProvidersList;
