import React, { memo } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer } from 'react-native-drawer-layout';
import * as Haptics from 'expo-haptics';

import { useGlobalStore } from '@/store/global';
import TopicList from './components/TopicList';
import { useStyles } from './style';

/**
 * TopicDrawer - 右侧Topic抽屉组件
 * 负责展示当前会话下的所有topic列表
 */
const TopicDrawer = memo(({ children }: { children: React.ReactNode }) => {
  const { styles } = useStyles();

  const [topicDrawerOpen, setTopicDrawerOpen] = useGlobalStore((s) => [
    s.topicDrawerOpen,
    s.setTopicDrawerOpen,
  ]);

  return (
    <Drawer
      drawerPosition="right"
      drawerStyle={styles.drawerStyle}
      drawerType="slide"
      hideStatusBarOnOpen={false}
      onClose={() => {
        setTopicDrawerOpen(false);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onOpen={() => {
        setTopicDrawerOpen(true);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      open={topicDrawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeAreaView}>
          <View style={styles.drawerContent}>
            <TopicList />
          </View>
        </SafeAreaView>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
    >
      {children}
    </Drawer>
  );
});

TopicDrawer.displayName = 'TopicDrawer';

export default TopicDrawer;
