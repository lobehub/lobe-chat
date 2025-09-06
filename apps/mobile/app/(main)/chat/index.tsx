import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useGlobalStore } from '@/store/global';
import Hydration from '@/features/Hydration';
import TopicDrawer from '@/features/TopicDrawer';
import ChatHeader from '@/features/chat/ChatHeader';
import ChatInput from '@/features/chat/ChatInput';
import ChatList from '@/features/chat/ChatList';
import SessionList from '@/features/SideBar';
import { useStyles } from './styles';

export default function ChatWithDrawer() {
  const insets = useSafeAreaInsets();
  const { styles } = useStyles();

  const [drawerOpen, setDrawerOpen, toggleDrawer] = useGlobalStore((s) => [
    s.drawerOpen,
    s.setDrawerOpen,
    s.toggleDrawer,
  ]);

  // 稳定的关闭抽屉函数引用
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), [setDrawerOpen]);
  const handleDrawerOpen = useCallback(() => setDrawerOpen(true), [setDrawerOpen]);

  // 将ChatContent改为接收props的组件，便于memo优化
  const ChatContent = useMemo(
    () =>
      memo<{
        containerStyle: any;
        onDrawerToggle: () => void;
      }>(({ onDrawerToggle, containerStyle }) => (
        <View style={containerStyle}>
          <ChatHeader onDrawerToggle={onDrawerToggle} />
          <ChatList />
          <KeyboardStickyView>
            <ChatInput />
          </KeyboardStickyView>
        </View>
      )),
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Hydration组件：处理URL和Store的双向同步 */}
      <Hydration />
      {/* 左侧Session抽屉 */}
      <Drawer
        drawerPosition="left"
        drawerStyle={styles.drawerStyle}
        drawerType="slide"
        hideStatusBarOnOpen={false}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        open={drawerOpen}
        overlayStyle={styles.drawerOverlay}
        renderDrawerContent={() => <SessionList />}
        swipeEdgeWidth={50}
        swipeEnabled={true}
      >
        {/* 右侧Topic抽屉 */}
        <TopicDrawer>
          <ChatContent containerStyle={styles.chatContainer} onDrawerToggle={toggleDrawer} />
        </TopicDrawer>
      </Drawer>
    </View>
  );
}
