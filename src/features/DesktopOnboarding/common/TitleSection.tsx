import { createStyles } from 'antd-style';
import { motion } from 'motion/react';

import { useTypographyStyles } from '../styles';

// TitleSection 组件的样式
const useTitleSectionStyles = createStyles(({ css }) => ({
  // 标题区域容器
  titleSection: css`
    text-align: center;
    margin-bottom: 48px;
    line-height: 1.4;
  `,
}));

interface TitleSectionProps {
  // 是否启用动画
  animated?: boolean;
  // 动画配置
  animation?: {
    animate?: any;
    initial?: any;
    transition?: any;
  };
  // Badge 文字
  badge: string;
  // 自定义样式类名
  className?: string;
  // 描述文字
  description: string;
  // 主标题
  title: string;
}

export const TitleSection = ({
  badge,
  title,
  description,
  animated = true,
  animation = {
    animate: { opacity: 1, y: 0 },
    initial: { opacity: 0, y: -50 },
    transition: { duration: 0.7 },
  },
  className,
}: TitleSectionProps) => {
  const { styles } = useTitleSectionStyles();
  const { styles: typographyStyles } = useTypographyStyles();

  const content = (
    <>
      <div className={typographyStyles.badge}>{badge}</div>
      <h1 className={typographyStyles.subtitle}>{title}</h1>
      <p className={typographyStyles.description}>{description}</p>
    </>
  );

  if (animated) {
    return (
      <motion.div
        animate={animation.animate}
        className={`${styles.titleSection} ${className || ''}`}
        initial={animation.initial}
        transition={animation.transition}
      >
        {content}
      </motion.div>
    );
  }

  // 静态版本（不带动画）
  return <div className={`${styles.titleSection} ${className || ''}`}>{content}</div>;
};
