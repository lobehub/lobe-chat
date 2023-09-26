import { ActionIcon } from '@lobehub/ui';
import { Dropdown, MenuProps } from 'antd';
import { useResponsive } from 'antd-style';
import { HardDriveDownload, Share2 } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { exportSingleAgent, exportSingleSession } from '@/helpers/export';
import { useSessionStore } from '@/store/session';

import Desktop from './Desktop';
import Mobile from './Mobile';

const Header = memo<{ mobile?: boolean }>(() => {
  const { t } = useTranslation('setting');
  const id = useSessionStore((s) => s.activeId);
  const { mobile } = useResponsive();

  const Render = mobile ? Mobile : Desktop;

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

  const size = mobile ? undefined : { fontSize: 24 };

  return (
    <Render>
      <ActionIcon icon={Share2} size={size} title={t('share', { ns: 'common' })} />
      <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
        <ActionIcon icon={HardDriveDownload} size={size} title={t('export', { ns: 'common' })} />
      </Dropdown>
    </Render>
  );
});

export default Header;
