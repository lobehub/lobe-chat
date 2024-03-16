import { ActionIcon, Icon, Tooltip } from '@lobehub/ui';
import { Badge, ConfigProvider, Dropdown, MenuProps } from 'antd';
import {
  Book,
  HardDriveDownload,
  HardDriveUpload,
  Heart,
  MonitorCheck, // Feather,
  // FileClock,
  // Github,
  QrCode,
  Settings,
  Settings2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ABOUT, DOCUMENTS } from '@/const/url';
import DataImporter from '@/features/DataImporter';
import { configService } from '@/services/config';
import { GlobalStore, useGlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

export interface BottomActionProps {
  tab?: GlobalStore['sidebarKey'];
}

const BottomActions = memo<BottomActionProps>(({ tab }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const [hasNewVersion, useCheckLatestVersion] = useGlobalStore((s) => [
    s.hasNewVersion,
    s.useCheckLatestVersion,
  ]);

  useCheckLatestVersion();

  const items: MenuProps['items'] = [
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
    // {
    //   icon: <Icon icon={Feather} />,
    //   key: 'feedback',
    //   label: t('feedback'),
    //   onClick: () => window.open(FEEDBACK, '__blank'),
    // },
    // {
    //   icon: <Icon icon={FileClock} />,
    //   key: 'changelog',
    //   label: t('changelog'),
    //   onClick: () => window.open(CHANGELOG, '__blank'),
    // },
    // {
    //   icon: <Icon icon={DiscordIcon} />,
    //   key: 'wiki',
    //   label: 'Discord',
    //   onClick: () => window.open(DISCORD, '__blank'),
    // },
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
        router.push('/settings/common');
      },
    },
  ];

  return (
    <>
      <Tooltip
        aria-label={'交流群'}
        placement="right"
        title={
          <div>
            <img
              alt="supermenit微信二维码"
              src="https://imgcdn.qqshsh.com/chat/supermenit.jpg"
              width={168}
            />
          </div>
        }
      >
        <ActionIcon icon={QrCode} placement="top" title={'加微信拉交流群'} />
      </Tooltip>
      <Link
        aria-label={'AI聚合客户端'}
        href={'https://pan.quark.cn/s/56a22c369594'}
        target={'_blank'}
      >
        <ActionIcon icon={MonitorCheck} placement={'right'} title={'下载AI聚合客户端'} />
      </Link>
      <Link aria-label={t('document')} href={DOCUMENTS} target={'_blank'}>
        <ActionIcon icon={Book} placement={'right'} title={t('document')} />
      </Link>
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
