import { createStyles } from 'antd-style';
import { memo, ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    padding: 16px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    transition: all 0.2s ease;

    &:hover {
      border-color: ${token.colorPrimary};
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  `,
  content: css`
    font-size: 14px;
    color: ${token.colorText};
    line-height: 1.6;
  `,
  footer: css`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid ${token.colorBorderSecondary};
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  label: css`
    display: inline-block;
    padding: 2px 8px;
    margin-right: 8px;
    margin-bottom: 4px;
    background: ${token.colorFillSecondary};
    border-radius: ${token.borderRadiusSM}px;
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
    margin-bottom: 8px;
  `,
  type: css`
    display: inline-block;
    padding: 2px 8px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    border-radius: ${token.borderRadiusSM}px;
    font-size: 12px;
    font-weight: 500;
  `,
}));

interface MemoryCardProps {
  content?: ReactNode;
  footer?: ReactNode;
  labels?: string[];
  title?: string;
  type?: string;
}

const MemoryCard = memo<MemoryCardProps>(({ title, type, content, footer, labels }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.card}>
      <Flexbox gap={8}>
        {type && <span className={styles.type}>{type}</span>}
        {title && <div className={styles.title}>{title}</div>}
        {content && <div className={styles.content}>{content}</div>}
        {labels && labels.length > 0 && (
          <Flexbox gap={4} horizontal wrap={'wrap'}>
            {labels.map((label, index) => (
              <span key={index} className={styles.label}>
                {label}
              </span>
            ))}
          </Flexbox>
        )}
        {footer && <div className={styles.footer}>{footer}</div>}
      </Flexbox>
    </div>
  );
});

export default MemoryCard;
