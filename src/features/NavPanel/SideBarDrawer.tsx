'use client';

import { ActionIcon, Text } from '@lobehub/ui';
import { Drawer } from 'antd';
import { useTheme } from 'antd-style';
import { XIcon } from 'lucide-react';
import { ReactNode, Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';

import { NAV_PANEL_RIGHT_DRAWER_ID } from './';
import SideBarHeaderLayout from './SideBarHeaderLayout';
import SkeletonList from './components/SkeletonList';

interface SideBarDrawerProps {
  action?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  open: boolean;
  subHeader?: ReactNode;
  title?: ReactNode;
}

const SideBarDrawer = memo<SideBarDrawerProps>(
  ({ subHeader, open, onClose, children, title, action }) => {
    const theme = useTheme();

    return (
      <Drawer
        closable={false}
        destroyOnHidden
        getContainer={() => document.querySelector(`#${NAV_PANEL_RIGHT_DRAWER_ID}`)!}
        mask={false}
        onClose={onClose}
        open={open}
        placement="left"
        rootStyle={{
          position: 'absolute',
        }}
        size={280}
        styles={{
          body: {
            background: theme.colorBgLayout,
            padding: 0,
          },
          header: {
            borderBottom: 'none',
            padding: 0,
          },
          wrapper: {
            borderLeft: `1px solid ${theme.colorBorderSecondary}`,
            borderRight: `1px solid ${theme.colorBorderSecondary}`,
            boxShadow: `4px 0 8px -2px rgba(0,0,0,.04)`,
            zIndex: 0,
          },
        }}
        title={
          <>
            <SideBarHeaderLayout
              left={
                typeof title === 'string' ? (
                  <Text ellipsis fontSize={14} style={{ paddingLeft: 4 }} weight={400}>
                    {title}
                  </Text>
                ) : (
                  title
                )
              }
              right={
                <>
                  {action}
                  <ActionIcon icon={XIcon} onClick={onClose} size={DESKTOP_HEADER_ICON_SIZE} />
                </>
              }
              showBack={false}
              showTogglePanelButton={false}
            />
            {subHeader}
          </>
        }
      >
        <Suspense
          fallback={
            <Flexbox gap={1} paddingBlock={1} paddingInline={4}>
              <SkeletonList rows={3} />
            </Flexbox>
          }
        >
          {children}
        </Suspense>
      </Drawer>
    );
  },
);

export default SideBarDrawer;
