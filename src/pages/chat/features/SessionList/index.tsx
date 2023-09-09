import { CollapseProps } from 'antd';
import { useResponsive } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import CollapseGroup from './CollapseGroup';
import Desktop from './Desktop';
import Inbox from './Inbox';
import SessionList from './List';
import Mobile from './Mobile';

export const Sessions = memo(() => {
  const { mobile } = useResponsive();
  const { t } = useTranslation('common');

  const Render = mobile ? Mobile : Desktop;

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
    <Render>
      <Inbox />
      <CollapseGroup defaultActiveKey={['sessionList']} items={items} />
    </Render>
  );
});
