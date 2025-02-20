'use client';

import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import 'dayjs/locale/zh.js';
import { CSSProperties, FC } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => {
  return {
    time: css`
      margin-block: calc(var(--lobe-markdown-margin-multiple) * 1em);

      font-size: 14px;
      line-height: var(--lobe-markdown-line-height);
      color: ${token.colorTextSecondary};
      letter-spacing: 0.02em;
    `,
  };
});

interface PrivacyUpdatedProps {
  className?: string;
  date: string;
  style?: CSSProperties;
  template?: string;
}
const PublishedTime: FC<PrivacyUpdatedProps> = ({
  date = new Date().toISOString(),
  style,
  className,
  template = 'dddd, MMMM D YYYY',
}) => {
  const { i18n } = useTranslation();
  const { styles, cx } = useStyles();
  const time = dayjs(date).locale(i18n.language).format(template);

  return (
    <time
      aria-label={'published-date'}
      className={cx(styles.time, className)}
      dateTime={time}
      style={style}
    >
      {time}
    </time>
  );
};

export default PublishedTime;
