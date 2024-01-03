import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    position: relative;

    overflow: hidden;
    display: block;

    width: 300px;
    height: 12px;

    border: 1px solid ${token.colorBorder};
    border-radius: 10px;

    &::after {
      content: '';

      position: absolute;
      top: 0;
      left: 0;

      box-sizing: border-box;
      width: 40%;
      height: 100%;

      background: ${token.colorPrimary};

      animation: animloader 2s linear infinite;
    }

    @keyframes animloader {
      0% {
        left: 0;
        transform: translateX(-100%);
      }

      100% {
        left: 100%;
        transform: translateX(0%);
      }
    }
  `,
);
const Loading = memo(() => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} gap={8} padding={16}>
      <span className={styles} />
      {t('loading.content')}
    </Flexbox>
  );
});

export default Loading;
