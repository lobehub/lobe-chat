import { ActionIcon, Avatar, Block, Flexbox, Text } from '@lobehub/ui-rn';
import { Link } from 'expo-router';
import { Settings2 } from 'lucide-react-native';

import { AVATAR_SIZE, ICON_SIZE } from '@/_const/common';
import { DEFAULT_USER_AVATAR } from '@/_const/meta';
import { useAuth } from '@/store/user';

export default function SessionFooter() {
  const { user } = useAuth();

  const displayName = user?.name || user?.username || user?.email || 'User';
  const userAvatar = user?.avatar || DEFAULT_USER_AVATAR;

  return (
    <Flexbox paddingBlock={16} paddingInline={12}>
      <Link asChild href="/setting">
        <Block
          align={'center'}
          glass
          horizontal
          justify={'space-between'}
          padding={4}
          pressEffect
          style={{ borderRadius: 100 }}
          variant={'outlined'}
        >
          <Flexbox align={'center'} gap={8} horizontal>
            <Avatar avatar={userAvatar} size={AVATAR_SIZE} title={displayName} />
            <Flexbox gap={4}>
              <Text ellipsis weight={500}>
                {displayName}
              </Text>
              <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
                {user?.email}
              </Text>
            </Flexbox>
          </Flexbox>
          <Link asChild href="/setting">
            <ActionIcon
              icon={Settings2}
              size={{
                blockSize: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE,
                size: ICON_SIZE,
              }}
            />
          </Link>
        </Block>
      </Link>
    </Flexbox>
  );
}
