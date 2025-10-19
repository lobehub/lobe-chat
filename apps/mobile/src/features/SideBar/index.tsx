import { LobeHub } from '@lobehub/icons-rn';
import { ActionIcon, Flexbox, PageContainer } from '@lobehub/ui-rn';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { CompassIcon, LucideComponent, MessageSquarePlus } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { ICON_SIZE } from '@/_const/common';
import { DRAWER_WIDTH } from '@/_const/theme';
import { useActionSWR } from '@/libs/swr';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { isIOS } from '@/utils/detection';
import { isDev } from '@/utils/env';

import Footer from './components/Footer';
import SessionList from './components/SessionList';
import { useStyles } from './style';

export default function SideBar({ children }: { children: ReactNode }) {
  const { styles, theme } = useStyles();
  const winDim = useWindowDimensions();

  const [drawerOpen, setDrawerOpen] = useGlobalStore((s) => [s.drawerOpen, s.setDrawerOpen]);
  const createSession = useSessionStore((s) => s.createSession);
  const { mutate: createNewSession, isValidating: isCreatingSession } = useActionSWR(
    ['session.createSession'],
    () => createSession(),
  );

  const onOpenDrawer = useCallback(() => setDrawerOpen(true), [setDrawerOpen]);
  const onCloseDrawer = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);

  return (
    <Drawer
      drawerPosition="left"
      drawerStyle={[
        styles.drawerStyle,
        styles.drawerBackground,
        { width: Math.round(Math.min(DRAWER_WIDTH, winDim.width * 0.8)) },
      ]}
      drawerType={isIOS ? 'slide' : 'front'}
      hideStatusBarOnOpen={false}
      onClose={() => {
        onCloseDrawer();
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onOpen={() => {
        onOpenDrawer();
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      open={drawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <PageContainer
          extra={
            <Flexbox align={'center'} gap={4} horizontal>
              {isDev && (
                <Link asChild href="/playground">
                  <ActionIcon
                    icon={LucideComponent}
                    size={{
                      blockSize: 36,
                      borderRadius: 36,
                      size: ICON_SIZE,
                    }}
                  />
                </Link>
              )}
              <ActionIcon
                icon={MessageSquarePlus}
                loading={isCreatingSession}
                onPress={() => createNewSession()}
                size={{
                  blockSize: 36,
                  borderRadius: 36,
                  size: ICON_SIZE,
                }}
              />
              <Link asChild href="/discover/assistant">
                <ActionIcon
                  icon={CompassIcon}
                  size={{
                    blockSize: 36,
                    borderRadius: 36,
                    size: ICON_SIZE,
                  }}
                />
              </Link>
            </Flexbox>
          }
          left={<LobeHub.Text color={theme.colorText} size={20} style={{ marginLeft: 8 }} />}
          style={styles.drawerBackground}
        >
          <SessionList />
          <Footer />
        </PageContainer>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
      swipeMinDistance={10}
      swipeMinVelocity={100}
    >
      {children}
    </Drawer>
  );
}
