'use client';

import { Divider } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { Trans } from 'react-i18next';

import { MORE_MODEL_PROVIDER_REQUEST_URL } from '@/const/url';

const Footer = memo(() => {
  return (
    <Divider>
      <p style={{ fontSize: 14 }}>
        <Trans i18nKey="llm.waitingForMore" ns={'setting'}>
          更多模型正在
          <Link aria-label={'todo'} href={MORE_MODEL_PROVIDER_REQUEST_URL} target="_blank">
            计划接入
          </Link>
          中 ，敬请期待 ✨
        </Trans>
      </p>
    </Divider>
  );
});

export default Footer;
