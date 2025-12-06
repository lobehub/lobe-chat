import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 8%);
    }
  `,
  content: css`
    font-size: 14px;
    line-height: 1.6;
    color: ${token.colorText};
  `,
  footer: css`
    margin-block-start: 12px;
    padding-block-start: 12px;
    border-block-start: 1px solid ${token.colorBorderSecondary};

    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
  label: css`
    display: inline-block;

    margin-block-end: 4px;
    margin-inline-end: 8px;
    padding-block: 2px;
    padding-inline: 8px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillSecondary};
  `,
  title: css`
    margin-block-end: 8px;
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  type: css`
    display: inline-block;

    padding-block: 2px;
    padding-inline: 8px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 12px;
    font-weight: 500;
    color: ${token.colorPrimary};

    background: ${token.colorPrimaryBg};
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
              <span className={styles.label} key={index}>
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
