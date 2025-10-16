import { ActionIcon, Flexbox, PageContainer, useTheme, useThemeMode } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { AlignJustify, MoreHorizontal } from 'lucide-react-native';
import { darken } from 'polished';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import Hydration from '@/features/Hydration';
import SideBar from '@/features/SideBar';
import TopicDrawer from '@/features/TopicDrawer';
import ChatInput from '@/features/chat/ChatInput';
import ChatList from '@/features/chat/ChatList';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

export default function ChatWithDrawer() {
  const theme = useTheme();
  const { isDarkMode } = useThemeMode();
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);
  const { t } = useTranslation(['chat']);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);

  const router = useRouter();

  const displayTitle = isInbox ? t('inbox.title', { ns: 'chat' }) : title;

  const renderContent = () => {
    return (
      <PageContainer
        backgroundColor={
          isDarkMode
            ? [theme.colorBgContainer, darken(0.04, theme.colorBgLayout)]
            : [theme.colorBgContainerSecondary, darken(0.04, theme.colorBgLayout)]
        }
        extra={
          <ActionIcon
            clickable={false}
            icon={MoreHorizontal}
            onPress={() => router.push('/chat/setting')}
          />
        }
        left={<ActionIcon clickable={false} icon={AlignJustify} onPress={toggleDrawer} />}
        title={displayTitle}
      >
        <KeyboardAvoidingView
          behavior="padding"
          enabled
          keyboardVerticalOffset={16}
          style={{ flex: 1 }}
        >
          <ChatList />
          <ChatInput />
        </KeyboardAvoidingView>
      </PageContainer>
    );
  };

  return (
    <Flexbox flex={1}>
      {/* Hydration组件：处理URL和Store的双向同步 */}
      <Hydration />
      <SideBar>
        <TopicDrawer>{renderContent()}</TopicDrawer>
      </SideBar>
    </Flexbox>
  );
}
