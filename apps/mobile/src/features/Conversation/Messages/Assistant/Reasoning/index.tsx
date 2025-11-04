import { Flexbox, Markdown, Text, createStyles } from '@lobehub/ui-rn';
import { ChevronRightIcon } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ReasoningProps {
  content?: string;
  duration?: number;
  id: string;
  isGenerating?: boolean;
}

// 格式化时间
const formatDuration = (ms?: number) => {
  if (!ms) return '';
  return ((ms || 0) / 1000).toFixed(1);
};

const useStyles = createStyles(({ token }) => ({
  content: {
    borderColor: token.colorBorderSecondary,

    overflow: 'hidden',
  },
  header: {
    borderRadius: 8,
  },
}));

/**
 * Reasoning - 推理/思考过程展示组件
 *
 * 显示 AI 的思考过程，支持折叠/展开
 */
const Reasoning = memo<ReasoningProps>(({ content = '', duration, isGenerating = false }) => {
  const { t } = useTranslation('chat');
  const { styles, theme } = useStyles();
  const [showDetail, setShowDetail] = useState(isGenerating);

  // Reanimated shared values
  const animatedValue = useSharedValue(0);

  const handleToggle = () => {
    setShowDetail(!showDetail);
  };

  useEffect(() => {
    if (!isGenerating) {
      setShowDetail(false);
    }
  }, [isGenerating]);

  // 动画效果
  useEffect(() => {
    animatedValue.value = withTiming(showDetail ? 1 : 0, {
      duration: 200,
    });
  }, [showDetail, animatedValue]);

  // 箭头旋转动画样式
  const arrowStyle = useAnimatedStyle(() => {
    const rotation = interpolate(animatedValue.value, [0, 1], [0, 90]);
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  // 内容动画样式
  const contentStyle = useAnimatedStyle(() => {
    const opacity = animatedValue.value;

    return {
      height: animatedValue.value ? 'auto' : 0,
      opacity,
    };
  });

  return (
    <Flexbox gap={8}>
      <Flexbox
        align="center"
        gap={4}
        horizontal
        justify={'space-between'}
        onPress={handleToggle}
        paddingBlock={4}
      >
        <Text type={'secondary'}>
          {isGenerating
            ? t('reasoning.thinking')
            : duration
              ? t('reasoning.thought', { duration: formatDuration(duration) })
              : t('reasoning.thoughtWithoutDuration')}
        </Text>
        <Animated.View style={arrowStyle}>
          <ChevronRightIcon color={theme.colorTextTertiary} size={16} />
        </Animated.View>
      </Flexbox>

      {showDetail && content && (
        <Animated.View style={contentStyle}>
          <Animated.View style={styles.content}>
            <Markdown
              animated={isGenerating}
              fontSize={14}
              headerMultiple={0.2}
              marginMultiple={0.5}
              style={{ opacity: 0.5 }}
            >
              {content}
            </Markdown>
          </Animated.View>
        </Animated.View>
      )}
    </Flexbox>
  );
});

Reasoning.displayName = 'Reasoning';

export default Reasoning;
