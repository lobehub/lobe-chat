import { useRouter } from 'expo-router';
import { AlignJustify, MoreHorizontal } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { AVATAR_SIZE } from '@/const/common';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import { useStyles } from './style';
import { ActionIcon, Avatar } from '@/components';
import { useTranslation } from 'react-i18next';

interface ChatHeaderProps {
  onDrawerToggle?: () => void;
}

export default function ChatHeader({ onDrawerToggle }: ChatHeaderProps) {
  const isInbox = useSessionStore(sessionSelectors.isInboxSession);
  const { t } = useTranslation(['chat']);
  const title = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const avatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const { styles } = useStyles();

  const router = useRouter();

  const displayTitle = isInbox ? t('inbox.title', { ns: 'chat' }) : title;

  return (
    <View style={[styles.header]}>
      <ActionIcon icon={AlignJustify} onPress={onDrawerToggle} />
      <View style={styles.headerContent}>
        <View style={styles.headerInfo}>
          <Avatar avatar={avatar} size={AVATAR_SIZE} />
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.title}>
            {displayTitle}
          </Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <ActionIcon icon={MoreHorizontal} onPress={() => router.push('/chat/setting')} />
      </View>
    </View>
  );
}
