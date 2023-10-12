import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { genSize, useStyles } from './style';

const LogoThree = dynamic(() => import('@lobehub/ui/es/LogoThree'));

const Hero = memo<{ mobile?: boolean; width: number }>(({ width, mobile }) => {
  const size = {
    base: genSize(width / 3.5, 240),
    desc: genSize(width / 50, 14),
    logo: genSize(width / 3.8, 180),
    title: genSize(width / 20, 32),
  };
  const { styles } = useStyles(size.base);

  const { t } = useTranslation('welcome');

  return (
    <>
      <div style={{ height: size.logo, marginTop: -size.logo / 5, width: size.logo }}>
        <LogoThree size={size.logo} />
      </div>
      <div className={styles.title} style={{ fontSize: size.title }}>
        <strong style={mobile ? { fontSize: '1.2em' } : {}}>LobeChat</strong>
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
