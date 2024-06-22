import { ActionIcon, FormItemProps } from '@lobehub/ui';
import { Input, Popover } from 'antd';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { isValidElement } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AES_GCM_URL } from '@/const/url';

import AesGcmNotice from './AesGcmNotice';

export const addAesGcmNotice = (apiKeyItem: FormItemProps[]) => {
  return apiKeyItem.map((item) => {
    const showTooltip = isValidElement(item.children) && item.children.type === Input.Password;
    if (!showTooltip) return item;
    return {
      ...item,
      label: (
        <Flexbox align={'center'} gap={4} horizontal>
          {item.label}
          <Link href={AES_GCM_URL} target={'_blank'}>
            <Popover arrow={false} content={<AesGcmNotice style={{ fontSize: 12 }} />}>
              <ActionIcon icon={ShieldCheck} size={{ blockSize: 20, fontSize: 14 }} />
            </Popover>
          </Link>
        </Flexbox>
      ),
    };
  });
};
