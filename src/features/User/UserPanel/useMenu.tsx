import { ActionIcon, DiscordIcon, Icon } from '@lobehub/ui';
import { Badge } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import {
  Book,
  CircleUserRound,
  Cloudy,
  Download,
  Feather,
  FileClockIcon,
  HardDriveDownload,
  HardDriveUpload,
  LifeBuoy,
  LogOut,
  Mail,
  Maximize,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import type { MenuProps } from '@/components/Menu';
import { LOBE_CHAT_CLOUD } from '@/const/branding';
import {
  DISCORD,
  DOCUMENTS_REFER_URL,
  EMAIL_SUPPORT,
  GITHUB_ISSUES,
  OFFICIAL_URL,
  UTM_SOURCE,
  mailTo,
} from '@/const/url';
import { isServerMode } from '@/const/version';
import DataImporter from '@/features/DataImporter';
import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { configService } from '@/services/config';
import { SettingsTabs } from '@/store/global/initialState';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { useNewVersion } from './useNewVersion';

const NewVersionBadge = memo(
  ({
    children,
    showBadge,
    onClick,
  }: PropsWithChildren & { onClick: () => void; showBadge?: boolean }) => {
    const { t } = useTranslation('common');
    if (!showBadge)
      return (
        <Flexbox flex={1} onClick={onClick}>
          {children}
        </Flexbox>
      );
    return (
      <Flexbox align={'center'} flex={1} gap={8} horizontal onClick={onClick} width={'100%'}>
        <span>{children}</span>
        <Badge count={t('upgradeVersion.hasNew')} />
      </Flexbox>
    );
  },
);

export const useMenu = () => {
  const router = useQueryRoute();
  const { canInstall, install } = usePWAInstall();
  const hasNewVersion = useNewVersion();
  const openSettings = useOpenSettings();
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const { showCloudPromotion, hideDocs } = useServerConfigStore(featureFlagsSelectors);
  const [isLogin, isLoginWithAuth, isLoginWithClerk, openUserProfile] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoginWithAuth(s),
    authSelectors.isLoginWithClerk(s),
    s.openUserProfile,
  ]);

  const profile: MenuProps['items'] = [
    {
      icon: <Icon icon={CircleUserRound} />,
      key: 'profile',
      label: t('userPanel.profile'),
      onClick: () => openUserProfile(),
    },
  ];

  const settings: MenuProps['items'] = [
    {
      extra: (
        <ActionIcon
          icon={Maximize}
          onClick={() => router.push(urlJoin('/settings', SettingsTabs.Common))}
          size={'small'}
          title={t('fullscreen')}
        />
      ),
      icon: <Icon icon={Settings2} />,
      key: 'setting',
      label: (
        <NewVersionBadge onClick={openSettings} showBadge={hasNewVersion}>
          {t('userPanel.setting')}
        </NewVersionBadge>
      ),
    },
    {
      type: 'divider',
    },
  ];

  /* ↓ cloud slot ↓ */

  /* ↑ cloud slot ↑ */

  const pwa: MenuProps['items'] = [
    {
      icon: <Icon icon={Download} />,
      key: 'pwa',
      label: t('installPWA'),
      onClick: () => install(),
    },
    {
      type: 'divider',
    },
  ];

  const data = !isLogin
    ? []
    : ([
        {
          icon: <Icon icon={HardDriveDownload} />,
          key: 'import',
          label: <DataImporter>{t('import')}</DataImporter>,
        },
        isServerMode
          ? null
          : {
              children: [
                {
                  key: 'allAgent',
                  label: t('exportType.allAgent'),
                  onClick: configService.exportAgents,
                },
                {
                  key: 'allAgentWithMessage',
                  label: t('exportType.allAgentWithMessage'),
                  onClick: configService.exportSessions,
                },
                {
                  key: 'globalSetting',
                  label: t('exportType.globalSetting'),
                  onClick: configService.exportSettings,
                },
                {
                  type: 'divider',
                },
                {
                  key: 'all',
                  label: t('exportType.all'),
                  onClick: configService.exportAll,
                },
              ],
              icon: <Icon icon={HardDriveUpload} />,
              key: 'export',
              label: t('export'),
            },
        {
          type: 'divider',
        },
      ].filter(Boolean) as ItemType[]);

  const helps: MenuProps['items'] = [
    showCloudPromotion && {
      icon: <Icon icon={Cloudy} />,
      key: 'cloud',
      label: (
        <Link href={`${OFFICIAL_URL}?utm_source=${UTM_SOURCE}`} target={'_blank'}>
          {t('userPanel.cloud', { name: LOBE_CHAT_CLOUD })}
        </Link>
      ),
    },
    {
      icon: <Icon icon={FileClockIcon} />,
      key: 'changelog',
      label: <Link href={'/changelog'}>{t('changelog')}</Link>,
    },
    {
      children: [
        {
          icon: <Icon icon={Book} />,
          key: 'docs',
          label: (
            <Link href={DOCUMENTS_REFER_URL} target={'_blank'}>
              {t('userPanel.docs')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Feather} />,
          key: 'feedback',
          label: (
            <Link href={GITHUB_ISSUES} target={'_blank'}>
              {t('userPanel.feedback')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={DiscordIcon} />,
          key: 'discord',
          label: (
            <Link href={DISCORD} target={'_blank'}>
              {t('userPanel.discord')}
            </Link>
          ),
        },
        {
          icon: <Icon icon={Mail} />,
          key: 'email',
          label: (
            <Link href={mailTo(EMAIL_SUPPORT)} target={'_blank'}>
              {t('userPanel.email')}
            </Link>
          ),
        },
      ],
      icon: <Icon icon={LifeBuoy} />,
      key: 'help',
      label: t('userPanel.help'),
    },
    {
      type: 'divider',
    },
  ].filter(Boolean) as ItemType[];

  const mainItems = [
    {
      type: 'divider',
    },
    ...(isLoginWithClerk ? profile : []),
    ...(isLogin ? settings : []),
    /* ↓ cloud slot ↓ */

    /* ↑ cloud slot ↑ */
    ...(canInstall ? pwa : []),
    ...data,
    ...(!hideDocs ? helps : []),
  ].filter(Boolean) as MenuProps['items'];

  const logoutItems: MenuProps['items'] = isLoginWithAuth
    ? [
        {
          icon: <Icon icon={LogOut} />,
          key: 'logout',
          label: <span>{t('signout', { ns: 'auth' })}</span>,
        },
      ]
    : [];

  return { logoutItems, mainItems };
};
