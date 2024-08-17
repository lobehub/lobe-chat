'use client';

import { createStyles } from 'antd-style';
import { CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => ({
  desc: css`
    line-height: 1.4;
    color: ${token.colorTextDescription};
  `,
  header: css`
    padding-block: 24px 0;
    padding-inline: 0.75rem;
  `,
  title: css`
    margin: 0;
    font-size: 26px;
    font-weight: 600;
    line-height: 1.3;
  `,
}));

interface PanelTitleProps {
  desc?: string;
  style?: CSSProperties;
  title?: string;
}

const PanelTitle = memo(({ title, desc, style }: PanelTitleProps) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.header} gap={4} style={style}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.desc}>{desc}</p>
    </Flexbox>
  );
});

export default PanelTitle;
