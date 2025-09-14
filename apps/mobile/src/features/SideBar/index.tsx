import React from 'react';
import { View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { useGlobalStore } from '@/store/global';
import * as Haptics from 'expo-haptics';
import { useStyles } from './style';

import Header from './components/Header';
import Footer from './components/Footer';
import SessionList from './components/SessionList';

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
        <View style={styles.container}>
          <Header />
          <SessionList />
          <Footer />
        </View>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
    >
      {children}
    </Drawer>
  );
}
