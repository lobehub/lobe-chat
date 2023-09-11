import { LogoThree } from '@lobehub/ui';
import { useResponsive } from 'antd-style';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSize, useStyles } from './style';

const Hero = memo<{ width: number }>(({ width }) => {
  const size = useMemo(
    () => ({
      base: genSize(width / 3.5, 240),
      desc: genSize(width / 50, 14),
      logo: genSize(width / 3.8, 180),
      title: genSize(width / 20, 32),
    }),
    [width],
  );
  const { styles } = useStyles(size.base);
  const { mobile } = useResponsive();
  const { t } = useTranslation('welcome');

  return (
    <>
      <LogoThree size={size.logo} style={{ marginTop: -size.logo / 5 }} />
      <div className={styles.title} style={{ fontSize: size.title }}>
        <span style={mobile ? { fontSize: '1.2em' } : {}}>LobeChat</span>
        {mobile ? <br /> : ' '}
        {t('slogan.title')}
      </div>
      <div className={styles.desc} style={{ fontSize: size.desc }}>
        {t('slogan.desc1')}
      </div>
    </>
  );
});

export default Hero;
