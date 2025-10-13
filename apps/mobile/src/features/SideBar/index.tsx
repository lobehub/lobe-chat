import { ActionIcon, PageContainer, Space } from '@lobehub/ui-rn';
import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { CompassIcon, Sparkles } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { DRAWER_WIDTH } from '@/_const/theme';
import { useGlobalStore } from '@/store/global';
import { isDev } from '@/utils/env';

import Footer from './components/Footer';
import SessionList from './components/SessionList';
import { useStyles } from './style';

export default function SideBar({ children }: { children: ReactNode }) {
  const { styles } = useStyles();
  const winDim = useWindowDimensions();

  const [drawerOpen, setDrawerOpen] = useGlobalStore((s) => [s.drawerOpen, s.setDrawerOpen]);

  return (
    <Drawer
      drawerPosition="left"
      drawerStyle={[
        styles.drawerStyle,
        { width: Math.round(Math.min(DRAWER_WIDTH, winDim.width * 0.8)) },
      ]}
      drawerType="slide"
      hideStatusBarOnOpen={false}
      onClose={() => {
        setDrawerOpen(false);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onOpen={() => {
        setDrawerOpen(true);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      open={drawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <PageContainer
          extra={
            <Space>
              {isDev && (
                <Link asChild href="/playground">
                  <ActionIcon icon={Sparkles} />
                </Link>
              )}
              <Link asChild href="/discover/assistant">
                <ActionIcon icon={CompassIcon} />
              </Link>
            </Space>
          }
          left={<Text style={styles.headerTitle}>LobeChat</Text>}
        >
          <SessionList />
          <Footer />
        </PageContainer>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
    >
      {children}
    </Drawer>
  );
}
