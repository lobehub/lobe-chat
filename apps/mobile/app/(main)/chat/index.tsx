import { ActionIcon, Avatar, PageContainer, Space } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { AlignJustify, MoreHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { AVATAR_SIZE } from '@/_const/common';
import Hydration from '@/features/Hydration';
import SideBar from '@/features/SideBar';
import TopicDrawer from '@/features/TopicDrawer';
import ChatInput from '@/features/chat/ChatInput';
import ChatList from '@/features/chat/ChatList';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import { useStyles } from './style';

export default function ChatWithDrawer() {
  const { styles, token } = useStyles();

  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);
  const { t } = useTranslation(['chat']);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);

  const router = useRouter();

  const displayTitle = isInbox ? t('inbox.title', { ns: 'chat' }) : title;

  const renderContent = () => {
    return (
      <PageContainer
        extra={<ActionIcon icon={MoreHorizontal} onPress={() => router.push('/chat/setting')} />}
        left={<ActionIcon icon={AlignJustify} onPress={toggleDrawer} />}
        title={
          <Space>
            <Avatar avatar={avatar} size={AVATAR_SIZE} />
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
              {displayTitle}
            </Text>
          </Space>
        }
      >
        <KeyboardAvoidingView
          behavior="padding"
          enabled
          keyboardVerticalOffset={token.marginXS}
          style={{ flex: 1 }}
        >
          <ChatList />
          <ChatInput />
        </KeyboardAvoidingView>
      </PageContainer>
    );
  };

  return (
    <View style={styles.root}>
      {/* Hydration组件：处理URL和Store的双向同步 */}
      <Hydration />
      <SideBar>
        <TopicDrawer>{renderContent()}</TopicDrawer>
      </SideBar>
    </View>
  );
}
