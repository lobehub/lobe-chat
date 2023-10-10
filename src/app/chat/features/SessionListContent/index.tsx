import { CollapseProps } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import CollapseGroup from './CollapseGroup';
import Inbox from './Inbox';
import SessionList from './List';

const SessionListContent = memo(() => {
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
    <>
      <Inbox />
      <CollapseGroup defaultActiveKey={['sessionList']} items={items} />
    </>
  );
});

export default SessionListContent;
