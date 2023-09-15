import { GridBackground, Icon, Logo } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { PackageCheck } from 'lucide-react';
import { rgba } from 'polished';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import pkg from '@/../package.json';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  background: css`
    position: absolute;
    bottom: -10%;
    left: 0;
    width: 100%;
  `,
  banner: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    max-width: 1024px;
    height: 160px;
    padding: 4px;

    background: radial-gradient(
      120% 120% at 20% 100%,
      ${isDarkMode ? rgba(token.colorBgContainer, 0.5) : token.colorBgContainer} 32%,
      ${isDarkMode ? token.colorPrimaryBgHover : rgba(token.colorPrimaryBgHover, 0.3)} 50%,
      ${isDarkMode ? token.colorPrimaryHover : rgba(token.colorPrimaryHover, 0.3)} 100%
    );
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
  logo: css`
    position: absolute;
    top: 50%;
    left: 32px;
    transform: translateY(-50%);
  `,
  mobile: css`
    margin-top: -16px;

    .ant-tabs-tab,
    .ant-tabs-tab + .ant-tabs-tab {
      margin: 4px 8px !important;
    }
  `,
  tag: css`
    position: absolute;
    top: 6px;
    right: 12px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${isDarkMode ? token.colorPrimaryBg : token.colorPrimaryActive};

    opacity: 0.5;
  `,
}));

const Banner = memo<{ nav: ReactNode }>(({ nav }) => {
  const { styles, theme } = useStyles();
  const { mobile } = useResponsive();

  if (mobile)
    return (
      <Flexbox align={'flex-end'} className={styles.mobile} horizontal justify={'center'}>
        {nav}
      </Flexbox>
    );

  return (
    <Flexbox align={'flex-end'} className={styles.banner} horizontal justify={'center'}>
      <GridBackground
        animation
        className={styles.background}
        colorBack={theme.colorFillSecondary}
        colorFront={theme.colorPrimary}
        random
      />
      {nav}
      <div className={styles.logo}>
        <Logo extra={'Chat'} type={'text'} />
      </div>
      <Flexbox align={'center'} className={styles.tag} gap={4} horizontal>
        <Icon icon={PackageCheck} />
        <div>{`${pkg.version}`}</div>
      </Flexbox>
    </Flexbox>
  );
});

export default Banner;
