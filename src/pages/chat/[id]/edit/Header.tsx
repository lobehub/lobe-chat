import { ActionIcon, ChatHeader } from '@lobehub/ui';
import { Dropdown, MenuProps } from 'antd';
import { FolderOutput, Share2 } from 'lucide-react';
import Router from 'next/router';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import HeaderTitle from '@/components/HeaderTitle';

const Header = memo(() => {
  const { t } = useTranslation('setting');

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'agent',
        label: <div>{t('exportType.agent', { ns: 'common' })}</div>,
      },
      {
        key: 'agentWithMessage',
        label: <div>{t('exportType.agentWithMessage', { ns: 'common' })}</div>,
      },
    ],
    [],
  );

  return (
    <ChatHeader
      left={<HeaderTitle title={t('header.session')} />}
      onBackClick={() => Router.back()}
      right={
        <>
          <ActionIcon icon={Share2} size={{ fontSize: 24 }} title={t('share', { ns: 'common' })} />
          <Dropdown arrow={false} menu={{ items }} trigger={['click']}>
            <ActionIcon
              icon={FolderOutput}
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
