import { RenderMessageExtra } from '@lobehub/ui';
import { Divider } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

import Translate from './Translate';

export const UserMessageExtra: RenderMessageExtra = memo(({ extra, id }) => {
  const hasTranslate = !!extra?.translate;

  const loading = useSessionStore((s) => s.chatLoadingId === id);
  return (
    <Flexbox gap={8} style={{ marginTop: hasTranslate ? 8 : 0 }}>
      {extra?.translate && (
        <div>
          <Divider style={{ margin: '12px 0' }} />
          <Translate id={id} {...extra.translate} loading={loading} />
        </div>
      )}
    </Flexbox>
  );
});
