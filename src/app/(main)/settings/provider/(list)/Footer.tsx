'use client';

import { useTheme } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { Trans } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { MORE_MODEL_PROVIDER_REQUEST_URL } from '@/const/url';

const Footer = memo(() => {
  const theme = useTheme();
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
        <Trans i18nKey="llm.waitingForMore" ns={'setting'}>
          更多模型正在
          <Link aria-label={'todo'} href={MORE_MODEL_PROVIDER_REQUEST_URL} target="_blank">
            计划接入
          </Link>
          中 ，敬请期待
        </Trans>
      </div>
    </Center>
  );
});

export default Footer;
