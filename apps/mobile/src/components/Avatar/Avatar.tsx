import { isValidElement, memo, useState } from 'react';
import { Image, Text, View } from 'react-native';

import { DEFAULT_AVATAR } from '@/_const/meta';
import { isEmoji } from '@/utils/common';

import FluentEmoji from '../FluentEmoji';
import { useStyles } from './style';
import type { AvatarProps } from './type';

const Avatar = memo<AvatarProps>(
  ({
    avatar = DEFAULT_AVATAR,
    size = 32,
    alt,
    animation = false,
    title,
    backgroundColor,
    style,
  }) => {
    const { styles } = useStyles({ backgroundColor, size });
    const [error, setError] = useState(false);

    const isStringAvatar = typeof avatar === 'string';

    const isDefaultAntAvatar = Boolean(
      avatar &&
        (['/', 'http', 'data:'].some((index) => isStringAvatar && avatar.startsWith(index)) ||
          isValidElement(avatar)),
    );

    if (isDefaultAntAvatar) {
      return (
        <View style={[styles.avatar, style]}>
          {isStringAvatar ? (
            <Image
              accessibilityLabel={alt}
              onError={() => setError(true)}
              source={{ uri: error ? DEFAULT_AVATAR : avatar }}
              style={styles.image}
              testID="avatar-image"
            />
          ) : (
            avatar
          )}
        </View>
      );
    }

    const text = String(isDefaultAntAvatar ? title : avatar);

    return (
      <View style={[styles.avatar, style]}>
        {isEmoji(avatar as string) ? (
          <FluentEmoji
            emoji={avatar as string}
            size={size * 0.8}
            type={animation ? 'anim' : '3d'}
          />
        ) : (
          <Text style={styles.fallbackText}>{text?.toUpperCase().slice(0, 2)}</Text>
        )}
      </View>
    );
  },
);

Avatar.displayName = 'Avatar';

export default Avatar;
