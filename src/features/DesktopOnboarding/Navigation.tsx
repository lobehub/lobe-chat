import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { m as motion } from 'motion/react';
import React from 'react';

// 组件特有样式 - 仅用于 Navigation 组件
const useStyles = createStyles(({ token, css }) => ({
  // 布局容器
  container: css`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  `,

  content: css`
    margin: 0 auto;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    padding: 24px 24px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48px;
  `,

  // 高亮按钮样式 - 仅在启用状态下生效
  highlightButton: css`
    &:not(:disabled) {
      background: ${token.colorHighlight} !important;
      border-color: ${token.colorHighlight} !important;
      color: ${token.colorBgBase} !important;
      font-weight: 500;

      &:hover {
        background: #ffe227 !important;
        border-color: #ffe227 !important;
      }
    }
  `,

  // 确保按钮在指示器上方
  navigationButton: css`
    z-index: 2;
    position: relative;
  `,

  // 导航按钮区域 - 已整合到 content 中，不再需要
  navigationContainer: css`
    display: contents;
  `,

  placeholder: css`
    width: 40px;
  `,

  // 进度指示器 - 绝对定位居中
  progressContainer: css`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1;
  `,

  progressDot: css`
    height: 6px;
    border-radius: 9999px;
    transition: all 0.3s ease;
    cursor: pointer;
  `,

  progressDotActive: css`
    width: 24px;
    background-color: ${token.colorHighlight};
  `,

  progressDotCompleted: css`
    width: 6px;
    background-color: ${token.colorTextSecondary};
  `,

  progressDotPending: css`
    width: 6px;
    background-color: ${token.colorTextQuaternary};
  `,

  squareButton: css`
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  `,
}));

interface NavigationProps {
  // 是否高亮下一步按钮
  // 动画配置
  animate?: boolean;
  // 动画持续时间（秒），默认 1
  animationDelay?: number;
  // 是否启用动画，默认 false
  animationDuration?: number;
  // 直接跳转到指定步骤
  canGoNext: boolean;
  canGoPrev: boolean;
  currentStep: number;
  nextButtonDisabled?: boolean;
  // 是否禁用下一步按钮
  nextButtonHighlight?: boolean;
  nextButtonText?: string;
  onGoToStep?: (step: number) => void;
  onNext: () => void;
  onPrev: () => void;
  prevButtonText?: string;
  showNextButton?: boolean;
  showPrevButton?: boolean;
  totalSteps: number; // 动画延迟时间（秒），默认 0
}

export const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onGoToStep,
  canGoNext,
  canGoPrev,
  prevButtonText = '',
  nextButtonText = 'Continue',
  showPrevButton = true,
  showNextButton = true,
  nextButtonDisabled = false,
  nextButtonHighlight = false,
  animate = false,
  animationDuration = 1,
  animationDelay = 0,
}) => {
  const { styles, cx } = useStyles();

  // 导航内容组件 - 单行布局
  const navigationContent = (
    <>
      {/* 左侧返回按钮 */}
      {showPrevButton ? (
        prevButtonText ? (
          // 有文字时显示完整按钮
          <Button
            className={styles.navigationButton}
            disabled={!canGoPrev}
            icon={<ChevronLeft size={16} />}
            onClick={onPrev}
            type={canGoPrev ? 'default' : 'dashed'}
          >
            {prevButtonText}
          </Button>
        ) : (
          // 无文字时只显示正方形图标按钮
          <Button
            className={cx(styles.squareButton, styles.navigationButton)}
            disabled={!canGoPrev}
            icon={<ChevronLeft size={16} />}
            onClick={onPrev}
            type={canGoPrev ? 'default' : 'dashed'}
          />
        )
      ) : (
        <div className={styles.placeholder} />
      )}

      {/* 中间进度指示器 */}
      <div className={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            className={cx(
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
              index > currentStep && styles.progressDotPending,
            )}
            key={index}
            onClick={() => onGoToStep && onGoToStep(index)}
          />
        ))}
      </div>

      {/* 右侧下一步按钮 */}
      {showNextButton ? (
        <Button
          className={cx(styles.navigationButton, nextButtonHighlight && styles.highlightButton)}
          disabled={nextButtonDisabled}
          onClick={onNext}
          type="primary"
        >
          {nextButtonText}
          {canGoNext && !nextButtonDisabled && <ChevronRight size={16} />}
        </Button>
      ) : (
        <div className={styles.placeholder} />
      )}
    </>
  );

  // 根据是否需要动画选择容器
  if (animate) {
    return (
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className={styles.container}
        initial={{ opacity: 0, y: 20 }}
        transition={{
          delay: animationDelay,
          duration: animationDuration,
          ease: 'easeOut',
        }}
      >
        <div className={styles.content}>{navigationContent}</div>
      </motion.div>
    );
  }

  // 无动画版本
  return (
    <div className={styles.container}>
      <div className={styles.content}>{navigationContent}</div>
    </div>
  );
};
