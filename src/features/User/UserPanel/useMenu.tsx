import { ActionIcon, DiscordIcon, Icon } from '@lobehub/ui';
import { Badge } from 'antd';
import {
  Book,
  CircleUserRound,
  Feather,
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
import { DISCORD, DOCUMENTS, EMAIL_SUPPORT, GITHUB_ISSUES } from '@/const/url';
import DataImporter from '@/features/DataImporter';
import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { configService } from '@/services/config';
import { SettingsTabs } from '@/store/global/initialState';
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
  const hasNewVersion = useNewVersion();
  const openSettings = useOpenSettings();
  const { t } = useTranslation(['common', 'setting', 'auth']);
  const isSignedIn = useUserStore(authSelectors.isLoginWithAuth);

  const settings: MenuProps['items'] = [
    {
      icon: <Icon icon={Settings2} />,
      key: 'setting',
      label: (
        <Flexbox align={'center'} gap={8} horizontal>
          <NewVersionBadge onClick={openSettings} showBadge={hasNewVersion}>
            {t('userPanel.setting')}
          </NewVersionBadge>
          <ActionIcon
            icon={Maximize}
            onClick={() => router.push(urlJoin('/settings', SettingsTabs.Common))}
            size={'small'}
            title={t('fullscreen')}
          />
        </Flexbox>
      ),
    },
    {
      type: 'divider',
    },
  ];

  const exports: MenuProps['items'] = [
    {
      icon: <Icon icon={HardDriveUpload} />,
      key: 'import',
      label: <DataImporter>{t('import')}</DataImporter>,
    },
    {
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
      icon: <Icon icon={HardDriveDownload} />,
      key: 'export',
      label: t('export'),
    },
    {
      type: 'divider',
    },
  ];

  const openUserProfile = useUserStore((s) => s.openUserProfile);

  const planAndBilling: MenuProps['items'] = [
    {
      icon: <Icon icon={CircleUserRound} />,
      key: 'profile',
      label: t('userPanel.profile'),
      onClick: () => {
        openUserProfile();
      },
    },
    {
      type: 'divider',
    },
  ];

  const helps: MenuProps['items'] = [
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
      children: [
        {
          icon: <Icon icon={Book} />,
          key: 'docs',
          label: (
            <Link href={DOCUMENTS} target={'_blank'}>
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
          icon: <Icon icon={Mail} />,
          key: 'email',
          label: (
            <Link href={`mailto:${EMAIL_SUPPORT}`} target={'_blank'}>
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
  ];

  const mainItems = [
    {
      type: 'divider',
    },
    ...settings,
    ...(isSignedIn ? planAndBilling : []),
    ...exports,
    ...helps,
  ].filter(Boolean) as MenuProps['items'];

  const logoutItems: MenuProps['items'] = [
    {
      icon: <Icon icon={LogOut} />,
      key: 'logout',
      label: <span>{t('signout', { ns: 'auth' })}</span>,
    },
  ];

  return { logoutItems, mainItems };
};
