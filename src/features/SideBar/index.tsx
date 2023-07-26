import { ActionIcon, Icon, SideNav } from '@lobehub/ui';
import { Dropdown, type MenuProps } from 'antd';
import {
  Feather,
  FileClock,
  FolderInput,
  FolderOutput,
  Github,
  Heart,
  MessageSquare,
  Settings,
  Settings2,
  Sticker,
} from 'lucide-react';
import Router from 'next/router';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { bugs, homepage } from '@/../package.json';
import AvatarWithUpload from '@/features/AvatarWithUpload';
import { useSettings } from '@/store/settings';

export default memo(() => {
  const [tab, setTab] = useSettings((s) => [s.sidebarKey, s.switchSideBar], shallow);
  const { t } = useTranslation('common');
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={FolderInput} />,
        key: 'import',
        label: <div>{t('import')}</div>,
      },
      {
        children: [
          {
            key: 'allAgent',
            label: <div>{t('exportType.allAgent')}</div>,
          },
          {
            key: 'allAgentWithMessage',
            label: <div>{t('exportType.allAgentWithMessage')}</div>,
          },
          {
            key: 'globalSetting',
            label: <div>{t('exportType.globalSetting')}</div>,
          },
          {
            type: 'divider',
          },
          {
            key: 'all',
            label: <div>{t('exportType.all')}</div>,
          },
        ],
        icon: <Icon icon={FolderOutput} />,
        key: 'export',
        label: t('export'),
      },
      {
        type: 'divider',
      },
      {
        icon: <Icon icon={Feather} />,
        key: 'feedback',
        label: (
          <a href={bugs.url} rel="noreferrer" target={'_blank'}>
            {t('feedback')}
          </a>
        ),
      },
      {
        icon: <Icon icon={FileClock} />,
        key: 'changelog',
        label: (
          <a href={`${homepage}/blob/master/CHANGELOG.md`} rel="noreferrer" target={'_blank'}>
            {t('changelog')}
          </a>
        ),
      },
      {
        icon: <Icon icon={Heart} />,
        key: 'about',
        label: (
          <a href={homepage} rel="noreferrer" target={'_blank'}>
            {t('about')}
          </a>
        ),
      },
      {
        type: 'divider',
      },
      {
        icon: <Icon icon={Settings} />,
        key: 'setting',
        label: <div onClick={() => Router.push('/setting')}>{t('setting')}</div>,
      },
    ],
    [],
  );

  return (
    <SideNav
      avatar={<AvatarWithUpload />}
      bottomActions={
        <>
          <a href={homepage} rel="noreferrer" target={'_blank'}>
            <ActionIcon icon={Github} />
          </a>
          <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
            <ActionIcon icon={Settings2} />
          </Dropdown>
        </>
      }
      style={{ height: '100vh' }}
      topActions={
        <>
          <ActionIcon
            active={tab === 'chat'}
            icon={MessageSquare}
            onClick={() => setTab('chat')}
            size="large"
          />
          <ActionIcon
            active={tab === 'market'}
            icon={Sticker}
            onClick={() => setTab('market')}
            size="large"
          />
        </>
      }
    />
  );
});
