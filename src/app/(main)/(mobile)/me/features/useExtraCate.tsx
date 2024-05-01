import { DiscordIcon, Icon } from '@lobehub/ui';
import { Book, Feather, HardDriveDownload, HardDriveUpload, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type MenuProps } from '@/components/Menu';
import { AGENTS_INDEX_GITHUB_ISSUE, DISCORD, DOCUMENTS, EMAIL_SUPPORT } from '@/const/url';
import DataImporter from '@/features/DataImporter';
import { configService } from '@/services/config';

export const useExtraCate = () => {
  const { t } = useTranslation(['common', 'setting']);

  const iconSize = { fontSize: 20 };

  const exports: MenuProps['items'] = [
    {
      icon: <Icon icon={HardDriveUpload} size={iconSize} />,
      key: 'import',
      label: <DataImporter>{t('import')}</DataImporter>,
    },
    {
      icon: <Icon icon={HardDriveDownload} size={iconSize} />,
      key: 'export',
      label: t('export'),
      onClick: configService.exportAll,
    },
    {
      type: 'divider',
    },
  ];

  const helps: MenuProps['items'] = [
    {
      icon: <Icon icon={Book} size={iconSize} />,
      key: 'docs',
      label: t('userPanel.docs'),
      onClick: () => window.open(DOCUMENTS, '__blank'),
    },
    {
      icon: <Icon icon={Feather} size={iconSize} />,
      key: 'feedback',
      label: t('userPanel.feedback'),
      onClick: () => window.open(AGENTS_INDEX_GITHUB_ISSUE, '__blank'),
    },
    {
      icon: <Icon icon={DiscordIcon} size={iconSize} />,
      key: 'discord',
      label: t('userPanel.discord'),
      onClick: () => window.open(DISCORD, '__blank'),
    },
    {
      icon: <Icon icon={Mail} size={iconSize} />,
      key: 'email',
      label: t('userPanel.email'),
      onClick: () => window.open(`mailto:${EMAIL_SUPPORT}`, '__blank'),
    },
  ];

  const mainItems = [
    {
      type: 'divider',
    },
    ...exports,
    ...helps,
  ].filter(Boolean) as MenuProps['items'];

  return mainItems;
};
