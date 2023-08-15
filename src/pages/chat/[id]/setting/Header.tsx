import { ActionIcon, ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { Dropdown, MenuProps } from 'antd';
import { HardDriveDownload, Share2 } from 'lucide-react';
import Router from 'next/router';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { exportSingleAgent, exportSingleSession } from '@/helpers/export';
import { useSessionStore } from '@/store/session';

const Header = memo(() => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        key: 'agent',
        label: <div>{t('exportType.agent', { ns: 'common' })}</div>,
        onClick: () => {
          if (!id) return;

          exportSingleAgent(id);
        },
      },
      {
        key: 'agentWithMessage',
        label: <div>{t('exportType.agentWithMessage', { ns: 'common' })}</div>,
        onClick: () => {
          if (!id) return;

          exportSingleSession(id);
        },
      },
    ],
    [],
  );

  return (
    <ChatHeader
      left={<ChatHeaderTitle title={t('header.session')} />}
      onBackClick={() => Router.back()}
      right={
        <>
          <ActionIcon icon={Share2} size={{ fontSize: 24 }} title={t('share', { ns: 'common' })} />
          <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
            <ActionIcon
              icon={HardDriveDownload}
              size={{ fontSize: 24 }}
              title={t('export', { ns: 'common' })}
            />
          </Dropdown>
        </>
      }
      showBackButton
    />
  );
});

export default Header;
