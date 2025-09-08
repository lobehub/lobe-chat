import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { useGlobalStore } from '@/store/global';
import Hydration from '@/features/Hydration';
import TopicDrawer from '@/features/TopicDrawer';
import ChatInput from '@/features/chat/ChatInput';
import ChatList from '@/features/chat/ChatList';
import SideBar from '@/features/SideBar';
import { useStyles } from './styles';
import ChatHeader from '@/features/chat/ChatHeader';

export default function ChatWithDrawer() {
  const { styles } = useStyles();

  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeAreaView}>
      {/* Hydration组件：处理URL和Store的双向同步 */}
      <Hydration />
      <SideBar>
        <ChatHeader onDrawerToggle={toggleDrawer} />
        <TopicDrawer>
          <KeyboardAvoidingView
            behavior="padding"
            enabled
            keyboardVerticalOffset={110}
            style={{ flex: 1 }}
          >
            <ChatList />
            <ChatInput />
          </KeyboardAvoidingView>
        </TopicDrawer>
      </SideBar>
    </SafeAreaView>
  );
}
