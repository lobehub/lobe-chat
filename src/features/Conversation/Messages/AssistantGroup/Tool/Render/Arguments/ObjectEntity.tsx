import { createStyles } from 'antd-style';
import { memo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { shinyTextStylish } from '@/styles/loading';

import ValueCell from './ValueCell';

const useStyles = createStyles(({ css, token }) => ({
  arrayRow: css`
    &:not(:first-child) {
      border-block-start: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  colon: css`
    color: ${token.colorTextTertiary};
  `,
  key: css`
    color: ${token.colorTextTertiary};
  `,
  row: css`
    display: flex;
    align-items: baseline;

    &:not(:first-child) {
      border-block-start: 1px dotted ${token.colorBorderSecondary};
    }
  `,
  shineText: shinyTextStylish(token),
  value: css`
    color: ${token.colorTextSecondary};
  `,
}));

const formatValue = (value: any): string | string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : v));
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(', ');
  }
  return String(value);
};

interface ObjectEntityProps {
  editable?: boolean;
  hasMinWidth: boolean;
  objectKey: string;
  shine?: boolean;
  value: any;
}

const ObjectEntity = memo<ObjectEntityProps>(({ hasMinWidth, shine, value, objectKey }) => {
  const { styles, cx } = useStyles();
  const isMobile = useIsMobile();
  const formatedValue = formatValue(value);

  return (
    <div className={styles.row}>
      <span
        className={styles.key}
        style={{ minWidth: hasMinWidth ? (isMobile ? 60 : 140) : undefined }}
      >
        {objectKey}
      </span>
      <span className={styles.colon}>:</span>
      <div className={cx(shine ? styles.shineText : styles.value)} style={{ width: '100%' }}>
        {typeof formatedValue === 'string' ? (
          <ValueCell value={formatedValue} />
        ) : (
          formatedValue.map((v, i) => <ValueCell key={i + v} value={v} />)
        )}
      </div>
    </div>
  );
});

export default ObjectEntity;
