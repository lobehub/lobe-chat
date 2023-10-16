import { ActionIcon, DiscordIcon, Icon } from '@lobehub/ui';
import { Badge, ConfigProvider, Dropdown, MenuProps, Upload } from 'antd';
import {
  Book,
  Feather,
  FileClock,
  Github,
  HardDriveDownload,
  HardDriveUpload,
  Heart,
  Settings,
  Settings2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ABOUT, CHANGELOG, DISCORD, FEEDBACK, GITHUB, WIKI } from '@/const/url';
import { useExportConfig } from '@/hooks/useExportConfig';
import { useImportConfig } from '@/hooks/useImportConfig';
import { GlobalStore, useGlobalStore } from '@/store/global';
import { SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

export interface BottomActionProps {
  setTab: GlobalStore['switchSideBar'];
  tab: GlobalStore['sidebarKey'];
}

const BottomActions = memo<BottomActionProps>(({ tab, setTab }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { exportSessions, exportSettings, exportAll, exportAgents } = useExportConfig();
  const { importConfig } = useImportConfig();

  const [hasNewVersion, useCheckLatestVersion] = useGlobalStore((s) => [
    s.hasNewVersion,
    s.useCheckLatestVersion,
  ]);

  useCheckLatestVersion();

  const items: MenuProps['items'] = [
    {
      icon: <Icon icon={HardDriveUpload} />,
      key: 'import',
      label: (
        <Upload maxCount={1} onChange={importConfig} showUploadList={false}>
          {t('import')}
        </Upload>
      ),
    },
    {
      children: [
        {
          key: 'allAgent',
          label: <div>{t('exportType.allAgent')}</div>,
          onClick: exportAgents,
        },
        {
          key: 'allAgentWithMessage',
          label: <div>{t('exportType.allAgentWithMessage')}</div>,
          onClick: exportSessions,
        },
        {
          key: 'globalSetting',
          label: <div>{t('exportType.globalSetting')}</div>,
          onClick: exportSettings,
        },
        {
          type: 'divider',
        },
        {
          key: 'all',
          label: <div>{t('exportType.all')}</div>,
          onClick: exportAll,
        },
      ],
      icon: <Icon icon={HardDriveDownload} />,
      key: 'export',
      label: t('export'),
    },
    {
      type: 'divider',
    },
    {
      icon: <Icon icon={Feather} />,
      key: 'feedback',
      label: t('feedback'),
      onClick: () => window.open(FEEDBACK, '__blank'),
    },
    {
      icon: <Icon icon={FileClock} />,
      key: 'changelog',
      label: t('changelog'),
      onClick: () => window.open(CHANGELOG, '__blank'),
    },
    {
      icon: <Icon icon={Book} />,
      key: 'wiki',
      label: 'WIKI',
      onClick: () => window.open(WIKI, '__blank'),
    },
    {
      icon: <Icon icon={Heart} />,
      key: 'about',
      label: t('about'),
      onClick: () => window.open(ABOUT, '__blank'),
    },
    {
      type: 'divider',
    },
    {
      icon: <Icon icon={Settings} />,
      key: 'setting',
      label: (
        <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
          {t('setting')} {hasNewVersion && <Badge count={t('upgradeVersion.hasNew')} />}
        </Flexbox>
      ),
      onClick: () => {
        setTab(SidebarTabKey.Setting);
        useGlobalStore.setState({
          settingsTab: SettingsTabs.Common,
          sidebarKey: SidebarTabKey.Setting,
        });
        router.push('/settings/common');
      },
    },
  ];

  return (
    <>
      <ActionIcon
        icon={DiscordIcon}
        onClick={() => window.open(DISCORD, '__blank')}
        placement={'right'}
        title={'Discord'}
      />
      <ActionIcon
        icon={Github}
        onClick={() => window.open(GITHUB, '__blank')}
        placement={'right'}
        title={'GitHub'}
      />
      <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
        {hasNewVersion ? (
          <Flexbox>
            <ConfigProvider theme={{ components: { Badge: { dotSize: 8 } } }}>
              <Badge dot offset={[-4, 4]}>
                <ActionIcon active={tab === SidebarTabKey.Setting} icon={Settings2} />
              </Badge>
            </ConfigProvider>
          </Flexbox>
        ) : (
          <ActionIcon active={tab === SidebarTabKey.Setting} icon={Settings2} />
        )}
      </Dropdown>
    </>
  );
});

export default BottomActions;
