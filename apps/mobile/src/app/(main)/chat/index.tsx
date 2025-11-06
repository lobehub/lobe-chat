import { ActionIcon, Flexbox, PageContainer, useTheme } from '@lobehub/ui-rn';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ChevronRightIcon,
  Clock,
  MessageSquarePlusIcon,
  TextAlignStartIcon,
} from 'lucide-react-native';
import { darken } from 'polished';
import { useTranslation } from 'react-i18next';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import ChatInput from '@/features/ChatInput';
import { ChatList } from '@/features/Conversation';
import Hydration from '@/features/Hydration';
import SideBar from '@/features/SideBar';
import TopicDrawer from '@/features/TopicDrawer';
import { useSinglePress } from '@/hooks/useSinglePress';
import { useSwitchTopic } from '@/hooks/useSwitchSession';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';
import { isIOS } from '@/utils/detection';

export default function ChatWithDrawer() {
  const theme = useTheme();
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const toggleTopicDrawer = useGlobalStore((s) => s.toggleTopicDrawer);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);
  const switchTopic = useSwitchTopic();
  const activeTopicId = useChatStore((s) => s.activeTopicId);
  const { t } = useTranslation('chat');
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);

  const router = useRouter();
  const { handlePress: handleTitlePress, isPressed: isNavigating } = useSinglePress(() => {
    router.push('/chat/setting');
  });

  const displayTitle = isInbox ? t('inbox.title') : title;
  const isInDefaultTopic = !activeTopicId;

  const renderContent = () => {
    return (
      <LinearGradient
        colors={[theme.colorBgContainerSecondary, darken(0.04, theme.colorBgLayout)]}
        locations={[0.2, 1]}
        style={{ flex: 1 }}
      >
        <PageContainer
          backgroundColor={'transparent'}
          extra={
            <Flexbox align={'center'} gap={1} horizontal>
              <ActionIcon
                disabled={isInDefaultTopic}
                icon={MessageSquarePlusIcon}
                onPress={() => switchTopic()}
                pressEffect={false}
              />
              <ActionIcon icon={Clock} onPress={toggleTopicDrawer} pressEffect={false} />
            </Flexbox>
          }
          headerBackgroundColor={theme.colorBgContainerSecondary}
          left={<ActionIcon icon={TextAlignStartIcon} onPress={toggleDrawer} pressEffect={false} />}
          onTitlePress={isInbox || isNavigating ? undefined : handleTitlePress}
          title={displayTitle}
          titleIcon={isInbox ? undefined : ChevronRightIcon}
        >
          <KeyboardStickyView offset={{ closed: 0, opened: isIOS ? 32 : 16 }} style={{ flex: 1 }}>
            <ChatList />
            <ChatInput />
          </KeyboardStickyView>
        </PageContainer>
      </LinearGradient>
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
