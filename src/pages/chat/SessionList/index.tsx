import { DraggablePanelBody } from '@lobehub/ui';
import { CollapseProps } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';

import CollapseGroup from './CollapseGroup';
import Header from './Header';
import Inbox from './Inbox';
import SessionList from './List';

export const Sessions = memo(() => {
  const { t } = useTranslation('common');

  const items: CollapseProps['items'] = useMemo(
    () => [
      {
        children: <SessionList />,
        key: 'sessionList',
        label: t('sessionList'),
      },
    ],
    [],
  );

  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody style={{ padding: 0 }}>
        <Flexbox>
          <Inbox />
          <CollapseGroup defaultActiveKey={['sessionList']} items={items} />
        </Flexbox>
      </DraggablePanelBody>
    </FolderPanel>
  );
});
