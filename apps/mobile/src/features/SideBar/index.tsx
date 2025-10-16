import { LobeHub } from '@lobehub/icons-rn';
import { ActionIcon, Flexbox, PageContainer } from '@lobehub/ui-rn';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { CompassIcon, LucideComponent } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { DRAWER_WIDTH } from '@/_const/theme';
import { useGlobalStore } from '@/store/global';
import { isIOS } from '@/utils/detection';
import { isDev } from '@/utils/env';

import Footer from './components/Footer';
import SessionList from './components/SessionList';
import { useStyles } from './style';

export default function SideBar({ children }: { children: ReactNode }) {
  const { styles, theme } = useStyles();
  const winDim = useWindowDimensions();

  const [drawerOpen, setDrawerOpen] = useGlobalStore((s) => [s.drawerOpen, s.setDrawerOpen]);

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
                      blockSize: 32,
                      borderRadius: 32,
                      size: 20,
                    }}
                  />
                </Link>
              )}
              <Link asChild href="/discover/assistant">
                <ActionIcon
                  icon={CompassIcon}
                  size={{
                    blockSize: 32,
                    borderRadius: 32,
                    size: 20,
                  }}
                />
              </Link>
            </Flexbox>
          }
          left={<LobeHub.Text color={theme.colorText} size={18} />}
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
