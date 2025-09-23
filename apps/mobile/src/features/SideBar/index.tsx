import React from 'react';

import { Drawer } from 'react-native-drawer-layout';

import { useGlobalStore } from '@/store/global';
import * as Haptics from 'expo-haptics';
import { useStyles } from './style';

import Footer from './components/Footer';
import SessionList from './components/SessionList';
import { Link } from 'expo-router';
import { Sparkles, CompassIcon } from 'lucide-react-native';
import { Text } from 'react-native';

import { isDev } from '@/utils/env';
import { ActionIcon, Space, PageContainer } from '@/components';

export default function SideBar({ children }: { children: React.ReactNode }) {
  const { styles } = useStyles();

  const [drawerOpen, setDrawerOpen] = useGlobalStore((s) => [s.drawerOpen, s.setDrawerOpen]);

  return (
    <Drawer
      drawerPosition="left"
      drawerStyle={styles.drawerStyle}
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
