import { Block, Flexbox, Markdown, Text, createStyles } from '@lobehub/ui-rn';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    borderColor: token.colorBorder,
    borderLeftWidth: 3,
    marginBottom: 16,
    paddingLeft: 16,
  },
  header: {
    borderRadius: 8,
  },
  shinyText: {
    // 移动端简化动画效果，只显示普通文本
    opacity: 0.6,
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

  const handleToggle = () => {
    setShowDetail(!showDetail);
  };

  useEffect(() => {
    if (!isGenerating) {
      setShowDetail(false);
    }
  }, [isGenerating]);

  return (
    <>
      <Block
        align="center"
        gap={8}
        horizontal
        onPress={handleToggle}
        paddingBlock={8}
        variant={'borderless'}
      >
        <Text
          color={isGenerating ? undefined : theme.colorTextTertiary}
          style={isGenerating && styles.shinyText}
        >
          {isGenerating
            ? t('reasoning.thinking')
            : duration
              ? t('reasoning.thought', { duration: formatDuration(duration) })
              : t('reasoning.thoughtWithoutDuration')}
        </Text>

        {showDetail ? (
          <ChevronDownIcon color={theme.colorTextTertiary} size={16} />
        ) : (
          <ChevronRightIcon color={theme.colorTextTertiary} size={16} />
        )}
      </Block>

      {showDetail && content && (
        <Flexbox style={styles.content}>
          <Markdown animated={isGenerating} style={{ opacity: 0.5 }}>
            {content}
          </Markdown>
        </Flexbox>
      )}
    </>
  );
});

Reasoning.displayName = 'Reasoning';

export default Reasoning;
