import { Avatar, Icon } from '@lobehub/ui-rn';
import { Link } from 'expo-router';
import { Settings2 } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

import { AVATAR_SIZE } from '@/_const/common';
import { DEFAULT_USER_AVATAR } from '@/_const/meta';
import { useAuth } from '@/store/user';

import { useStyles } from './styles';

export default function SessionFooter() {
  const { styles } = useStyles();
  const { user } = useAuth();

  const displayName = user?.name || user?.username || user?.email || 'User';
  const userAvatar = user?.avatar || DEFAULT_USER_AVATAR;

  return (
    <Link asChild href="/setting">
      <TouchableOpacity activeOpacity={1}>
        <View style={[styles.footer]}>
          <View style={styles.userInfo}>
            <Avatar avatar={userAvatar} size={AVATAR_SIZE} title={displayName} />
            <Text numberOfLines={1} style={styles.userName}>
              {displayName}
            </Text>
          </View>

          <Icon icon={Settings2} />
        </View>
      </TouchableOpacity>
    </Link>
  );
}
