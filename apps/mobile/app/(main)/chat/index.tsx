import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGlobalStore } from '@/store/global';
import { ChatMessage } from '@/types/message';
import Hydration from '@/features/Hydration';
import TopicDrawer from '@/features/TopicDrawer';
import ChatHeader from './(components)/ChatHeader';
import ChatInput from './(components)/ChatInput';
import ChatList from './(components)/ChatList';
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
  const chatListRef = useRef<FlatList<ChatMessage>>(null);

  const ChatContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={styles.chatContainer}
    >
      <ChatHeader onDrawerToggle={toggleDrawer} />

      <ChatList scrollViewRef={chatListRef} />

      <ChatInput />
    </KeyboardAvoidingView>
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
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        open={drawerOpen}
        overlayStyle={styles.drawerOverlay}
        renderDrawerContent={() => <SessionList />}
        swipeEdgeWidth={50}
        swipeEnabled={true}
      >
        {/* 右侧Topic抽屉 */}
        <TopicDrawer>
          <ChatContent />
        </TopicDrawer>
      </Drawer>
    </View>
  );
}
