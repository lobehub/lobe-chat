import { createStyles } from 'antd-style';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode, useState } from 'react';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    margin-block-end: ${token.marginLG}px;
  `,

  header: css`
    cursor: pointer;

    display: flex;
    align-items: center;

    border-radius: ${token.borderRadius}px;

    color: ${token.colorTextTertiary};

    transition: all ${token.motionDurationMid} ease;

    &:hover {
      color: ${token.colorText};
    }
  `,

  title: css`
    margin-inline-start: 4px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorText};
  `,
}));

interface CollapsibleSectionProps {
  /** 子组件内容 */
  children: ReactNode;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
  /** 标题文本 */
  title: string;
}

const CollapsibleSection = ({
  title,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) => {
  const { styles, cx } = useStyles();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.container}>
      <div className={cx(styles.header)} onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className={styles.title}>{title}</span>
      </div>
      {isExpanded && <div>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
