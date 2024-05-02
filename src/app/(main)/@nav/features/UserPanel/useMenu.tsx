import { DiscordIcon, Icon } from '@lobehub/ui';
import { Badge } from 'antd';
import {
  Book,
  Feather,
  HardDriveDownload,
  HardDriveUpload,
  LifeBuoy,
  Mail,
  Settings2,
} from 'lucide-react';
import { PropsWithChildren, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { type MenuProps } from '@/components/Menu';
import { AGENTS_INDEX_GITHUB_ISSUE, DISCORD, DOCUMENTS, EMAIL_SUPPORT } from '@/const/url';
import DataImporter from '@/features/DataImporter';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { configService } from '@/services/config';

import { useNewVersion } from './useNewVersion';

export const useMenu = () => {
  const router = useQueryRoute();
  const hasNewVersion = useNewVersion();

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
          label: <div>{t('exportType.allAgent')}</div>,
          onClick: configService.exportAgents,
        },
        {
          key: 'allAgentWithMessage',
          label: <div>{t('exportType.allAgentWithMessage')}</div>,
          onClick: configService.exportSessions,
        },
        {
          key: 'globalSetting',
          label: <div>{t('exportType.globalSetting')}</div>,
          onClick: configService.exportSettings,
        },
        {
          type: 'divider',
        },
        {
          key: 'all',
          label: <div>{t('exportType.all')}</div>,
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

  const settings: MenuProps['items'] = [
    {
      icon: <Icon icon={Settings2} />,
      key: 'setting',
      label: <NewVersionBadge showBadge={hasNewVersion}>{t('userPanel.setting')}</NewVersionBadge>,
      onClick: () => router.push('/settings/m', { tab: 'common' }),
    },
    {
      type: 'divider',
    },
  ];

  const helps: MenuProps['items'] = [
    {
      icon: <Icon icon={DiscordIcon} />,
      key: 'discord',
      label: t('userPanel.discord'),
      onClick: () => window.open(DISCORD, '__blank'),
    },
    {
      children: [
        {
          icon: <Icon icon={Book} />,
          key: 'docs',
          label: t('userPanel.docs'),
          onClick: () => window.open(DOCUMENTS, '__blank'),
        },
        {
          icon: <Icon icon={Feather} />,
          key: 'feedback',
          label: t('userPanel.feedback'),
          onClick: () => window.open(AGENTS_INDEX_GITHUB_ISSUE, '__blank'),
        },
        {
          icon: <Icon icon={Mail} />,
          key: 'email',
          label: t('userPanel.email'),
          onClick: () => window.open(`mailto:${EMAIL_SUPPORT}`, '__blank'),
        },
      ],
      icon: <Icon icon={LifeBuoy} />,
      key: 'help',
      label: t('userPanel.help'),
    },
  ];

  const mainItems = [
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
