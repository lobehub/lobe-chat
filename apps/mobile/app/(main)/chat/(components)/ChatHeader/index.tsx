import { useRouter } from 'expo-router';
import { AlignJustify, MoreHorizontal } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import { ICON_SIZE } from '@/mobile/const/common';
import { DEFAULT_INBOX_TITLE } from '@/mobile/const/meta';
import { useSessionStore } from '@/mobile/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/mobile/store/session/selectors';
import { useThemeToken } from '@/mobile/theme';

import { useStyles } from './style';
import { Avatar } from '@/mobile/components';

interface ChatHeaderProps {
  onDrawerToggle?: () => void;
}

export default function ChatHeader({ onDrawerToggle }: ChatHeaderProps) {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const author = useSessionStore(sessionMetaSelectors.currentAgentAuthor);
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const token = useThemeToken();
  const { styles } = useStyles();

  const router = useRouter();

  const displayTitle = isInbox ? DEFAULT_INBOX_TITLE : title;

  return (
    <View style={[styles.header, { height: 44 }]}>
      <TouchableOpacity onPress={onDrawerToggle} style={styles.actionButton}>
        <AlignJustify color={token.colorText} size={ICON_SIZE} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <View style={styles.headerInfo}>
          <Avatar avatar={avatar} size={42} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{displayTitle}</Text>
            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.headerSubtitle}>
              {author}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => router.push('/chat/setting')} style={styles.actionButton}>
          <MoreHorizontal color={token.colorText} size={ICON_SIZE} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
