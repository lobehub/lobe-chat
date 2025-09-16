import { Text, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';
import { Settings2 } from 'lucide-react-native';

import Avatar from '@/components/Avatar';
import { ICON_SIZE } from '@/const/common';
import { DEFAULT_USER_AVATAR } from '@/const/meta';
import { useAuth } from '@/store/user';

import { useStyles } from './styles';

export default function SessionFooter() {
  const { styles, token } = useStyles();
  const { user } = useAuth();

  const displayName = user?.name || user?.username || user?.email || 'User';
  const userAvatar = user?.avatar || DEFAULT_USER_AVATAR;

  return (
    <Link asChild href="/setting">
      <TouchableOpacity activeOpacity={1} style={styles.settingsButton}>
        <View style={[styles.footer]}>
          <View style={styles.userInfo}>
            <Avatar avatar={userAvatar} size={32} title={displayName} />
            <Text numberOfLines={1} style={styles.userName}>
              {displayName}
            </Text>
          </View>

          <Settings2 color={token.colorText} size={ICON_SIZE} />
        </View>
      </TouchableOpacity>
    </Link>
  );
}
