'use client';

import { FluentEmoji } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const Hero = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('changelog');
  return (
    <Flexbox gap={8} paddingBlock={32} paddingInline={24}>
      <Flexbox align={'center'} gap={12} horizontal>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>{t('welcomeBack')}</h1>
        <FluentEmoji emoji={'🤯'} size={28} type={'anim'} />
      </Flexbox>
      <div style={{ color: theme.colorTextSecondary, fontSize: 16 }}>{t('addedWhileAway')}</div>
    </Flexbox>
  );
});

export default Hero;
