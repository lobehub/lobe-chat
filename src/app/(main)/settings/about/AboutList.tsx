import { Feather, FileClock, Heart } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ABOUT, CHANGELOG, FEEDBACK } from '@/const/url';

import Item from '../features/SettingList/Item';
import { useStyles } from './style';

const AboutList = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const items = [
    {
      icon: Feather,
      label: t('feedback', { ns: 'common' }),
      onClick: () => window.open(FEEDBACK, '__blank'),
      value: 'feedback',
    },
    {
      icon: FileClock,
      label: t('changelog', { ns: 'common' }),
      onClick: () => window.open(CHANGELOG, '__blank'),
      value: 'changelog',
    },
    {
      icon: Heart,
      label: t('about', { ns: 'common' }),
      onClick: () => window.open(ABOUT, '__blank'),
      value: 'about',
    },
  ];

  return (
    <div className={styles.wrapper}>
      <Flexbox className={styles.container} gap={24} padding={16}>
        <Flexbox className={styles.title} gap={8} horizontal>
          {t('about.title')}
        </Flexbox>
        <Flexbox width={'100%'}>
          {items.map(({ value, icon, label, onClick }) => (
            <div key={value} onClick={onClick}>
              <Item active={false} icon={icon} label={label} />
            </div>
          ))}
        </Flexbox>
      </Flexbox>
    </div>
  );
});

export default AboutList;
