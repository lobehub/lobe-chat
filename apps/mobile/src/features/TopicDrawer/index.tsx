import React, { memo } from 'react';
import { View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

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
      onClose={() => setTopicDrawerOpen(false)}
      onOpen={() => setTopicDrawerOpen(true)}
      open={topicDrawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <View style={styles.drawerContent}>
          <TopicList />
        </View>
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
