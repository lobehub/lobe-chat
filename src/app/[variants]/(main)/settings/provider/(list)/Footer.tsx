'use client';

import { Center } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { MORE_MODEL_PROVIDER_REQUEST_URL } from '@/const/url';

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
        <Trans
          components={[
            <span key="0" />,
            <Link
              aria-label={t('llm.waitingForMoreLinkAriaLabel')}
              href={MORE_MODEL_PROVIDER_REQUEST_URL}
              key="1"
              target="_blank"
            />,
          ]}
          i18nKey="llm.waitingForMore"
          ns={'setting'}
        />
      </div>
    </Center>
  );
});

export default Footer;
