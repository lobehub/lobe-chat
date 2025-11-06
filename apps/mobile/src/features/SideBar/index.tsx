import { LobeHub } from '@lobehub/icons-rn';
import { ActionIcon, Block, Flexbox } from '@lobehub/ui-rn';
import { Link, router } from 'expo-router';
import { CirclePlus, CompassIcon, LucideComponent } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { InteractionManager, useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_HEIGHT, ICON_SIZE } from '@/_const/common';
import { DRAWER_WIDTH } from '@/_const/theme';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { isDev } from '@/utils/env';

import Footer from './components/Footer';
import SessionList from './components/SessionList';
import { useStyles } from './style';

export default function SideBar({ children }: { children: ReactNode }) {
  const { styles, theme } = useStyles();
  const winDim = useWindowDimensions();
  const [drawerOpen, setDrawerOpen] = useGlobalStore((s) => [s.drawerOpen, s.setDrawerOpen]);
  const createSession = useSessionStore((s) => s.createSession);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const createNewSession = async () => {
    setIsCreatingSession(true);
    try {
      // Create session without auto-switching
      const sessionId = await createSession(undefined, false);

      // Close the Session Drawer
      setDrawerOpen(false);

      // Navigate to the new session after interactions complete
      InteractionManager.runAfterInteractions(() => {
        router.replace({
          params: { session: sessionId },
          pathname: '/chat',
        });
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

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
      drawerType={'front'}
      hideStatusBarOnOpen={false}
      onClose={() => {
        onCloseDrawer();
      }}
      onOpen={() => {
        onOpenDrawer();
      }}
      open={drawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <Block blur flex={1} style={[styles.drawerContent]} variant={'outlined'}>
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }} testID="page-container">
            <Flexbox
              align={'center'}
              gap={8}
              height={HEADER_HEIGHT}
              horizontal
              justify={'space-between'}
              paddingBlock={4}
              paddingInline={8}
            >
              <LobeHub.Text color={theme.colorText} size={20} style={{ marginLeft: 4 }} />
              <Flexbox align={'center'} gap={4} horizontal>
                {isDev && (
                  <Link asChild href="/playground">
                    <ActionIcon
                      icon={LucideComponent}
                      onPress={() => setDrawerOpen(false)}
                      size={{ blockSize: 36, borderRadius: 36, size: ICON_SIZE }}
                    />
                  </Link>
                )}
                <Link asChild href="/discover/assistant">
                  <ActionIcon
                    icon={CompassIcon}
                    onPress={() => setDrawerOpen(false)}
                    size={{ blockSize: 36, borderRadius: 36, size: ICON_SIZE }}
                  />
                </Link>
                <ActionIcon
                  icon={CirclePlus}
                  loading={isCreatingSession}
                  onPress={() => createNewSession()}
                  size={{
                    blockSize: 36,
                    borderRadius: 36,
                    size: ICON_SIZE,
                  }}
                />
              </Flexbox>
            </Flexbox>
            <SessionList />
            <Footer />
          </SafeAreaView>
        </Block>
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
