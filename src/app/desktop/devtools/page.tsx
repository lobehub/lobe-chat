'use client';

import { ActionIcon, SideNav } from '@lobehub/ui';
import { Cog, DatabaseIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import PostgresViewer from '@/features/DevPanel/PostgresViewer';
import SystemInspector from '@/features/DevPanel/SystemInspector';
import { useStyles } from '@/features/DevPanel/features/FloatPanel';
import { electronStylish } from '@/styles/electron';

const DevTools = memo(() => {
  const { styles, theme, cx } = useStyles();

  const items = [
    {
      children: <PostgresViewer />,
      icon: <DatabaseIcon size={16} />,
      key: 'Postgres Viewer',
    },
    {
      children: <SystemInspector />,
      icon: <Cog size={16} />,
      key: 'System Status',
    },
  ];

  const [tab, setTab] = useState<string>(items[0].key);

  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
      <Flexbox
        align={'center'}
        className={cx(`panel-drag-handle`, styles.header, electronStylish.draggable)}
        horizontal
        justify={'center'}
      >
        <Flexbox align={'baseline'} gap={6} horizontal>
          <b>{BRANDING_NAME} Dev Tools</b>
          <span style={{ color: theme.colorTextDescription }}>/</span>
          <span style={{ color: theme.colorTextDescription }}>{tab}</span>
        </Flexbox>
      </Flexbox>
      <Flexbox
        height={'100%'}
        horizontal
        style={{ background: theme.colorBgLayout, overflow: 'hidden', position: 'relative' }}
        width={'100%'}
      >
        <SideNav
          bottomActions={[]}
          style={{
            background: 'transparent',
            width: 48,
          }}
          topActions={items.map((item) => (
            <ActionIcon
              active={tab === item.key}
              icon={item.icon}
              key={item.key}
              onClick={() => setTab(item.key)}
              title={item.key}
              tooltipProps={{
                placement: 'right',
              }}
            />
          ))}
        />
        {items.map((item) => (
          <Flexbox
            flex={1}
            height={'100%'}
            key={item.key}
            style={{
              display: tab === item.key ? 'flex' : 'none',
              overflow: 'hidden',
            }}
          >
            {item.children}
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default DevTools;
