import { DraggablePanelBody, SearchBar } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionHydrated } from '@/store/session';

import SystemRole from './SystemRole';
import { Topic } from './Topic';

const Inner = memo<{ systemRole: boolean }>(({ systemRole }) => {
  const hydrated = useSessionHydrated();
  const { t } = useTranslation('common');

  return (
    <DraggablePanelBody style={{ padding: 0 }}>
      {systemRole && <SystemRole />}
      <Flexbox gap={16} padding={16}>
        <SearchBar placeholder={t('topic.searchPlaceholder')} spotlight type={'ghost'} />
        {!hydrated ? (
          <Flexbox gap={8} style={{ marginTop: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                active
                avatar={false}
                key={i}
                paragraph={{ rows: 1, width: '100%' }}
                round
                title={false}
              />
            ))}
          </Flexbox>
        ) : (
          <Topic />
        )}
      </Flexbox>
    </DraggablePanelBody>
  );
});

export default Inner;
