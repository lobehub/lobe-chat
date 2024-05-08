import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const UserLoginOrSignup = memo<{ onClick: () => void }>(({ onClick }) => {
  const { t } = useTranslation('auth');

  const items = [
    {
      icon: '🎁',
      label: t('loginGuide.f1'),
    },
    {
      icon: '☁️',
      label: t('loginGuide.f2'),
    },
    {
      icon: '🤖',
      label: t('loginGuide.f3'),
    },
    {
      icon: '🧩',
      label: t('loginGuide.f4'),
    },
  ];

  return (
    <Flexbox gap={16} paddingBlock={12} paddingInline={16} width={'100%'}>
      <div style={{ fontWeight: 'bold' }}>{t('loginGuide.title')}</div>
      <Flexbox gap={'0.5em'} horizontal style={{ maxWidth: 268 }} width={'100%'} wrap={'wrap'}>
        {items.map((item, index) => (
          <Flexbox align={'center'} gap={8} horizontal key={index} style={{ minWidth: 130 }}>
            <span>{item.icon}</span>
            {item.label}
          </Flexbox>
        ))}
      </Flexbox>
      <Button block onClick={onClick} type={'primary'}>
        {t('loginOrSignup')}
      </Button>
    </Flexbox>
  );
});

export default UserLoginOrSignup;
