'use client';

import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const Footer = memo(() => {
  const theme = useTheme();
  const { t } = useTranslation('setting');
  return (
    <Center
      style={{
        background: theme.colorFillQuaternary,
        border: `1px dashed ${theme.colorFillSecondary}`,
        borderRadius: theme.borderRadiusLG,
        padding: 12,
      }}
      width={'100%'}
    >
      <div style={{ color: theme.colorTextSecondary, fontSize: 12, textAlign: 'center' }}>
        {t('llm.waitingForMore')}
      </div>
    </Center>
  );
});

export default Footer;
