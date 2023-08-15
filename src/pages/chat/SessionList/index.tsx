import { DraggablePanelBody } from '@lobehub/ui';
import { CollapseProps } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import FolderPanel from '@/features/FolderPanel';

import CollapseGroup from './CollapseGroup';
import Header from './Header';
import Inbox from './Inbox';
import SessionList from './List';

const useStyles = createStyles(({ stylish }) => stylish.noScrollbar);

export const Sessions = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

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
      <DraggablePanelBody className={styles} style={{ padding: 0 }}>
        <Inbox />
        <CollapseGroup defaultActiveKey={['sessionList']} items={items} />
      </DraggablePanelBody>
    </FolderPanel>
  );
});
