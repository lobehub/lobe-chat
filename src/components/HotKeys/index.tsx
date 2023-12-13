'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { isString } from 'lodash-es';
import { Command, Delete, Option } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CLEAN_MESSAGE_KEY, META_KEY, PREFIX_KEY } from '@/const/hotkeys';
import { isApplePlatform } from '@/utils/platform';

const useStyles = createStyles(
  ({ css, token }) => css`
    font-size: 12px;

    span {
      font-weight: 600;
    }

    kbd {
      min-width: 16px;
      padding: 3px 6px;

      line-height: 1;
      color: ${token.colorTextDescription};
      text-align: center;

      background: ${token.colorBgContainer};
      border: 1px solid ${token.colorBorderSecondary};
      border-bottom-color: ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      box-shadow: inset 0 -1px 0 ${token.colorBorder};
    }
  `,
);

export interface HotKeysProps {
  desc?: string;
  keys: string;
}

const HotKeys = memo<HotKeysProps>(({ keys, desc }) => {
  const { styles } = useStyles();
  const [keysGroup, setKeysGroup] = useState(keys.split('+'));
  const visibility = typeof window === 'undefined' ? 'hidden' : 'visible';

  useEffect(() => {
    const mapping: Record<string, any> = {
      [CLEAN_MESSAGE_KEY]: isApplePlatform() ? <Icon icon={Delete} /> : 'backspace',
      [META_KEY]: isApplePlatform() ? <Icon icon={Command} /> : 'ctrl',
      [PREFIX_KEY]: isApplePlatform() ? <Icon icon={Option} /> : 'alt',
    };
    const newValue = keys
      .split('+')
      .filter(Boolean)
      .map((k) => mapping[k] ?? k);
    setKeysGroup(newValue);
  }, [keys]);

  const content = (
    <Flexbox align={'center'} className={styles} gap={2} horizontal>
      {keysGroup.map((key, index) => (
        <kbd key={index}>
          <span style={{ visibility }}>{isString(key) ? key.toUpperCase() : key}</span>
        </kbd>
      ))}
    </Flexbox>
  );

  if (!desc) return content;
  return (
    <Flexbox align={'center'} style={{ textAlign: 'center' }}>
      {desc}
      {content}
    </Flexbox>
  );
});

export default HotKeys;
