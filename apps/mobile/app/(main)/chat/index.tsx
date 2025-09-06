import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useGlobalStore } from '@/store/global';
import Hydration from '@/features/Hydration';
import TopicDrawer from '@/features/TopicDrawer';
import ChatHeader from '@/features/chat/ChatHeader';
import ChatInput from '@/features/chat/ChatInput';
import ChatList from '@/features/chat/ChatList';
import SideBar from '@/features/SideBar';
import { useStyles } from './styles';

export default function ChatWithDrawer() {
  const { styles } = useStyles();

  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeAreaView}>
      {/* Hydration组件：处理URL和Store的双向同步 */}
      <Hydration />
      <SideBar>
        <TopicDrawer>
          <View style={styles.chatContainer}>
            <ChatHeader onDrawerToggle={toggleDrawer} />
            <ChatList />
            <KeyboardStickyView>
              <ChatInput />
            </KeyboardStickyView>
          </View>
        </TopicDrawer>
      </SideBar>
    </SafeAreaView>
  );
}
