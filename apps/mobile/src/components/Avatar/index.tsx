import { Image, View, Text, ViewStyle, StyleProp } from 'react-native';
import { memo, ReactNode, useState, isValidElement } from 'react';
import { DEFAULT_AVATAR } from '@/const/meta';
import FluentEmoji from '../FluentEmoji';
import { isEmoji } from '@/utils/common';
import { useStyles } from './style';

export interface AvatarProps {
  /**
   * 替代文本，用于无障碍
   */
  alt?: string;
  /**
   * 是否启用动画
   * @default false
   */
  animation?: boolean;
  /**
   * 头像图片URL或Emoji
   */
  avatar?: string | ReactNode;
  /**
   * 背景颜色
   */
  backgroundColor?: string;
  /**
   * 头像尺寸，默认为32
   */
  size?: number;
  /**
   * 自定义样式
   */
  style?: StyleProp<ViewStyle>;
  /**
   * @description The title text to display if avatar is not provided
   */
  title?: string;
}

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

export default Avatar;
