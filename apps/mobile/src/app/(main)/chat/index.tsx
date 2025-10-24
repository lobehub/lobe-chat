import { ActionIcon, Flexbox, PageContainer, useTheme } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ChevronRightIcon, MessagesSquare, TextAlignStartIcon } from 'lucide-react-native';
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
import { isIOS } from '@/utils/detection';

export default function ChatWithDrawer() {
  const theme = useTheme();
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);
  const { t } = useTranslation('chat');
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);

  const router = useRouter();

  const displayTitle = isInbox ? t('inbox.title') : title;

  const renderContent = () => {
    return (
      <PageContainer
        backgroundColor={[theme.colorBgContainerSecondary, darken(0.04, theme.colorBgLayout)]}
        extra={<ActionIcon icon={MessagesSquare} onPress={toggleTopicDrawer} pressEffect={false} />}
        left={<ActionIcon icon={TextAlignStartIcon} onPress={toggleDrawer} pressEffect={false} />}
        onTitlePress={isInbox ? undefined : () => router.push('/chat/setting')}
        title={displayTitle}
        titleIcon={isInbox ? undefined : ChevronRightIcon}
      >
        <KeyboardAvoidingView
          behavior={isIOS ? 'padding' : 'translate-with-padding'}
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
