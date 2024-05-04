import { ActionIcon, DiscordIcon, Icon } from '@lobehub/ui';
import { Badge } from 'antd';
import {
  Book,
  Feather,
  HardDriveDownload,
  HardDriveUpload,
  LifeBuoy,
  Mail,
  Maximize,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { PropsWithChildren, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { type MenuProps } from '@/components/Menu';
import { DISCORD, DOCUMENTS, EMAIL_SUPPORT, GITHUB_ISSUES } from '@/const/url';
import DataImporter from '@/features/DataImporter';
import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { configService } from '@/services/config';
import { SettingsTabs } from '@/store/global/initialState';

import { useNewVersion } from './useNewVersion';

export const useMenu = () => {
  const router = useQueryRoute();
  const hasNewVersion = useNewVersion();
  const openSettings = useOpenSettings();
  const { t } = useTranslation(['common', 'setting']);

  const NewVersionBadge = useCallback(
    ({ children, showBadge }: PropsWithChildren & { showBadge?: boolean }) => {
      if (!showBadge) return children;
      return (
        <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal width={'100%'}>
          <span>{children}</span>
          <Badge count={t('upgradeVersion.hasNew')} />
        </Flexbox>
      );
    },
    [t],
  );

  const settings: MenuProps['items'] = [
    {
      icon: <Icon icon={Settings2} />,
      key: 'setting',
      label: (
        <Flexbox align={'center'} horizontal>
          <Flexbox flex={1} horizontal onClick={openSettings}>
            <NewVersionBadge showBadge={hasNewVersion}>{t('userPanel.setting')}</NewVersionBadge>
          </Flexbox>
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
  ];

  const mainItems = [
    {
      type: 'divider',
    },
    ...settings,
    ...exports,
    ...helps,
    {
      type: 'divider',
    },
  ].filter(Boolean) as MenuProps['items'];

  return {
    mainItems,
  };
};
