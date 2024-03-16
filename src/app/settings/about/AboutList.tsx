import { Heart } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ABOUT } from '@/const/url';

import Item from '../features/SettingList/Item';
import { useStyles } from './style';

const AboutList = memo(() => {
  const { t } = useTranslation('setting');
  const { styles } = useStyles();
  const items = [
    // {
    //   icon: Feather,
    //   label: t('feedback', { ns: 'common' }),
    //   onClick: () => window.open(FEEDBACK, '__blank'),
    //   value: 'feedback',
    // },
    // {
    //   icon: FileClock,
    //   label: t('changelog', { ns: 'common' }),
    //   onClick: () => window.open(CHANGELOG, '__blank'),
    //   value: 'changelog',
    // },
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
        <div>
          <p>
            为了能够持续免费为大家服务，我们面临着不小的成本挑战。我们诚挚邀请您加入我们的购物群(全网实时低价和羊毛信息)。在这里，您不仅可以支持我们的持续运营，还能享受到专属的购物优惠和精彩内容。让我们携手共创更美好的AI服务体验，让免费成为可能。
          </p>
          <div>
            <img alt="" src="https://imgcdn.qqshsh.com/chat/qwgwkht.jpg" width={168} />
            <img alt="" src="https://imgcdn.qqshsh.com/chat/myhzp.jpg" width={168} />
          </div>
        </div>

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
