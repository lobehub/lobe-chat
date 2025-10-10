'use client';

import { Switch } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface LabCardProps {
  checked: boolean;
  desc: string;
  meta?: string;
  onChange: (v: boolean) => void;
  title: string;
}

const useStyles = createStyles(({ css, token }) => ({
  card: css`
    width: 100%;
    max-width: 800px;
    margin-block: 0;
    margin-inline: auto;
    padding: 16px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowSecondary};
  `,
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  meta: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  row: css`
    display: grid;
    grid-template-columns: 240px 1fr 80px;
    gap: 16px;
    align-items: center;
  `,
  thumb: css`
    height: 128px;
    border-radius: ${token.borderRadiusLG}px;
    background: linear-gradient(135deg, ${token.colorFillTertiary}, ${token.colorFillQuaternary});
  `,
  title: css`
    font-size: 16px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  wrap: css`
    width: 100%;
  `,
}));

const LabCard = memo<PropsWithChildren<LabCardProps>>(
  ({ title, desc, checked, onChange, meta }) => {
    const { styles } = useStyles();

    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.row}>
            <div className={styles.thumb} />
            <Flexbox gap={6}>
              <div className={styles.title}>{title}</div>
              <div className={styles.desc}>{desc}</div>
              {meta ? <div className={styles.meta}>{meta}</div> : null}
            </Flexbox>
            <Flexbox align={'flex-end'} height={'100%'} justify={'center'}>
              <Switch checked={checked} onChange={onChange} />
            </Flexbox>
          </div>
        </div>
      </div>
    );
  },
);

LabCard.displayName = 'LabCard';

export default LabCard;
