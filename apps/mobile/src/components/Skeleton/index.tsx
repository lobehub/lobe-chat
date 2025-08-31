import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, StyleProp, DimensionValue } from 'react-native';

import { useStyles } from './style';

export interface SkeletonProps {
  /** Display animated shimmer effect */
  animated?: boolean;
  /** Show skeleton avatar */
  avatar?: boolean | { shape?: 'circle' | 'square'; size?: number };
  /** Content to show when loading is false */
  children?: React.ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Show skeleton paragraph */
  paragraph?: boolean | { rows?: number; width?: DimensionValue | DimensionValue[] };
  /** Custom style for skeleton container */
  style?: StyleProp<ViewStyle>;
  /** Show skeleton title */
  title?: boolean | { width?: DimensionValue };
}

const Skeleton: React.FC<SkeletonProps> = ({
  loading = true,
  avatar = false,
  title = true,
  paragraph = true,
  animated = false,
  style,
  children,
}) => {
  const { styles } = useStyles();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated && loading) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [animated, loading, shimmerAnim]);

  if (!loading) {
    return children;
  }

  const renderAvatar = () => {
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
          animated && {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />
    );
  };

  const renderTitle = () => {
    if (!title) return null;

    const titleProps = typeof title === 'object' ? title : {};
    const titleWidth = titleProps.width || '60%';

    return (
      <Animated.View
        style={[
          styles.skeletonItem,
          styles.titleLine,
          { width: titleWidth as any },
          animated && {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />
    );
  };

  const renderParagraph = () => {
    if (!paragraph) return null;

    const paragraphProps = typeof paragraph === 'object' ? paragraph : {};
    const rows = paragraphProps.rows || 3;
    const width = paragraphProps.width;

    const lines = [] as React.ReactNode[];
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
            styles.paragraphLine,
            { width: lineWidth as any },
            // Remove margin bottom from last line
            i === rows - 1 && { marginBottom: 0 },
            animated && {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />,
      );
    }

    return <View style={styles.paragraphContainer}>{lines}</View>;
  };

  const hasAvatar = !!avatar;
  const hasTitle = !!title;
  const hasParagraph = !!paragraph;

  // Special case: if only paragraph, render it directly
  if (!hasAvatar && !hasTitle && hasParagraph) {
    return <View style={[styles.container, style]}>{renderParagraph()}</View>;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {renderAvatar()}
        <View style={[styles.textContainer, !hasAvatar && styles.textContainerNoAvatar]}>
          {renderTitle()}
          {renderParagraph()}
        </View>
      </View>
    </View>
  );
};

// Skeleton.Avatar component
interface SkeletonAvatarProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  shape?: 'circle' | 'square';
  size?: number;
  style?: ViewStyle;
}

const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  shape = 'circle',
  animated = false,
  style,
}) => {
  const { styles } = useStyles();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [animated, shimmerAnim]);

  const avatarStyle = {
    borderRadius: shape === 'circle' ? size / 2 : 6,
    height: size,
    width: size,
  };

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        avatarStyle,
        animated && {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        style,
      ]}
    />
  );
};

// Skeleton.Title component
interface SkeletonTitleProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonTitle: React.FC<SkeletonTitleProps> = ({
  width = '60%',
  animated = false,
  style,
}) => {
  const { styles } = useStyles();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [animated, shimmerAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        styles.titleLine,
        { width },
        animated && {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        style,
      ]}
    />
  );
};

// Skeleton.Paragraph component
interface SkeletonParagraphProps {
  animated?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
  rows?: number;
  style?: ViewStyle;
  width?: DimensionValue | DimensionValue[];
}

const SkeletonParagraph: React.FC<SkeletonParagraphProps> = ({
  rows = 3,
  width,
  animated = false,
  style,
}) => {
  const { styles } = useStyles();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [animated, shimmerAnim]);

  const lines = [];
  for (let i = 0; i < rows; i++) {
    let lineWidth: DimensionValue = '100%';

    if (Array.isArray(width)) {
      lineWidth = width[i] || '100%';
    } else if (width) {
      lineWidth = width;
    } else if (i === rows - 1) {
      lineWidth = '60%'; // Last line is shorter by default
    }

    lines.push(
      <Animated.View
        key={i}
        style={[
          styles.skeletonItem,
          styles.paragraphLine,
          { width: lineWidth },
          // Remove margin bottom from last line
          i === rows - 1 && { marginBottom: 0 },
          animated && {
            opacity: shimmerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          },
        ]}
      />,
    );
  }

  return <View style={[styles.paragraphContainer, style]}>{lines}</View>;
};

// Skeleton.Image component
interface SkeletonImageProps {
  animated?: boolean;
  height?: DimensionValue;
  shape?: 'circle' | 'square';
  style?: ViewStyle;
  width?: DimensionValue;
}

const SkeletonImage: React.FC<SkeletonImageProps> = ({
  animated = false,
  width = 200,
  height = 200,
  shape = 'square',
  style,
}) => {
  const { styles } = useStyles();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 1,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            duration: 1000,
            toValue: 0,
            useNativeDriver: false,
          }),
        ]),
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [animated, shimmerAnim]);

  let extraBorderRadius: number | undefined;
  if (
    shape === 'circle' &&
    typeof width === 'number' &&
    typeof height === 'number' &&
    width === height
  ) {
    extraBorderRadius = width / 2;
  }

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        { height, width },
        typeof extraBorderRadius === 'number' && { borderRadius: extraBorderRadius },
        animated && {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
        },
        style,
      ]}
    />
  );
};

// Add compound components to main Skeleton component
const SkeletonWithCompounds = Skeleton as typeof Skeleton & {
  Avatar: typeof SkeletonAvatar;
  Image: typeof SkeletonImage;
  Paragraph: typeof SkeletonParagraph;
  Title: typeof SkeletonTitle;
};

SkeletonWithCompounds.Avatar = SkeletonAvatar;
SkeletonWithCompounds.Title = SkeletonTitle;
SkeletonWithCompounds.Paragraph = SkeletonParagraph;
SkeletonWithCompounds.Image = SkeletonImage;

export default SkeletonWithCompounds;
