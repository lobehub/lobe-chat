import { Icon } from '@lobehub/ui';
import { LockIcon } from 'lucide-react';
import Link from 'next/link';
import { CSSProperties, memo } from 'react';
import { Trans } from 'react-i18next';

import { AES_GCM_URL } from '@/const/url';

export const AesGcmNotice = memo<{ style?: CSSProperties }>(({ style }) => {
  return (
    <span style={style}>
      <Icon icon={LockIcon} style={{ marginRight: 4 }} />
      <Trans i18nKey="llm.aesGcm" ns={'setting'}>
        您的密钥将使用
        <Link href={AES_GCM_URL} style={{ marginInline: 4 }} target={'_blank'}>
          AES-GCM
        </Link>
        技术进行加密
      </Trans>
    </span>
  );
});

export default AesGcmNotice;
