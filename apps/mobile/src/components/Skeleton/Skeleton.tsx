import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { Animated } from 'react-native';

import Flexbox from '../Flexbox';
import SkeletonAvatar from './Avatar';
import SkeletonButton from './Button';
import SkeletonImage from './Image';
import SkeletonParagraph from './Paragraph';
import SkeletonTitle from './Title';
import { useStyles } from './style';
import type { SkeletonProps } from './type';
import { useSkeletonAnimation } from './useSkeletonAnimation';

const Skeleton = memo<SkeletonProps>(
  ({
    loading = true,
    avatar = false,
    title = true,
    paragraph = true,
    animated = false,
    style,
    children,
    fontSize = 16,
    ...rest
  }) => {
    const { styles } = useStyles();
    const opacityInterpolation = useSkeletonAnimation(animated && loading);

    const renderAvatar = useCallback(() => {
      if (!avatar) return null;

      const avatarProps = typeof avatar === 'object' ? avatar : {};
      const avatarSize = avatarProps.size || 40;
      const avatarShape = avatarProps.shape || 'circle';

      const avatarStyle = {
        borderRadius: avatarShape === 'circle' ? avatarSize / 2 : 6,
        height: avatarSize,
        width: avatarSize,
      };

      return (
        <Animated.View
          style={[
            styles.skeletonItem,
            avatarStyle,
            opacityInterpolation && { opacity: opacityInterpolation },
          ]}
        />
      );
    }, [avatar, styles.skeletonItem, opacityInterpolation]);

    const renderTitle = useCallback(() => {
      if (!title) return null;

      const titleProps = typeof title === 'object' ? title : {};
      const titleWidth = titleProps.width || '60%';

      return (
        <Animated.View
          style={[
            styles.skeletonItem,
            {
              height: fontSize,
            },
            { width: titleWidth as any },
            opacityInterpolation && { opacity: opacityInterpolation },
          ]}
        />
      );
    }, [title, styles.skeletonItem, opacityInterpolation, fontSize]);

    const renderParagraph = useCallback(() => {
      if (!paragraph) return null;

      const paragraphFontSize =
        typeof paragraph === 'object' && paragraph.fontSize ? paragraph.fontSize : 14;
      const paragraphProps = typeof paragraph === 'object' ? paragraph : {};
      const rows = paragraphProps.rows || 3;
      const width = paragraphProps.width;

      const lines = [] as ReactNode[];
      for (let i = 0; i < rows; i++) {
        let lineWidth = '100%';

        if (Array.isArray(width)) {
          lineWidth = (width[i] as string) || '100%';
        } else if (width) {
          lineWidth = width as string;
        } else if (i === rows - 1) {
          lineWidth = '60%'; // Last line is shorter by default
        }

        lines.push(
          <Animated.View
            key={i}
            style={[
              styles.skeletonItem,
              {
                height: paragraphFontSize,
              },
              { width: lineWidth as any },
              // Remove margin bottom from last line
              i === rows - 1 && { marginBottom: 0 },
              opacityInterpolation && { opacity: opacityInterpolation },
            ]}
          />,
        );
      }

      return <Flexbox gap={paragraphFontSize / 2}>{lines}</Flexbox>;
    }, [paragraph, styles.skeletonItem, styles.paragraphContainer, opacityInterpolation]);

    if (!loading) return children;

    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;

    // Special case: if only paragraph, render it directly
    if (!hasAvatar && !hasTitle && hasParagraph) {
      return (
        <Flexbox
          gap={fontSize * 0.5}
          style={[{ overflow: 'hidden', position: 'relative' }, style]}
          testID="skeleton"
          {...rest}
        >
          {renderParagraph()}
        </Flexbox>
      );
    }

    return (
      <Flexbox
        gap={12}
        horizontal
        style={[{ overflow: 'hidden', position: 'relative' }, style]}
        testID="skeleton"
        {...rest}
      >
        {renderAvatar()}
        <Flexbox flex={1} gap={fontSize * 0.5} style={{ overflow: 'hidden', position: 'relative' }}>
          {renderTitle()}
          {renderParagraph()}
        </Flexbox>
      </Flexbox>
    );
  },
);

Skeleton.displayName = 'Skeleton';

// Add compound components to main Skeleton component
const SkeletonWithCompounds = Skeleton as typeof Skeleton & {
  Avatar: typeof SkeletonAvatar;
  Button: typeof SkeletonButton;
  Image: typeof SkeletonImage;
  Paragraph: typeof SkeletonParagraph;
  Title: typeof SkeletonTitle;
};

SkeletonWithCompounds.Avatar = SkeletonAvatar;
SkeletonWithCompounds.Button = SkeletonButton;
SkeletonWithCompounds.Title = SkeletonTitle;
SkeletonWithCompounds.Paragraph = SkeletonParagraph;
SkeletonWithCompounds.Image = SkeletonImage;

export default SkeletonWithCompounds;
