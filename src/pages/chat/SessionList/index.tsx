import { DraggablePanelBody } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import FolderPanel from '@/features/FolderPanel';

import Header from './Header';
import Inbox from './Inbox';
import SessionList from './List';

export const Sessions = memo(() => {
  const { t } = useTranslation('common');

  return (
    <FolderPanel>
      <Header />
      <DraggablePanelBody style={{ padding: 0 }}>
        <Flexbox gap={8}>
          <Inbox />

          <Flexbox paddingInline={20} style={{ fontSize: 12, marginTop: 8 }}>
            {t('sessionList')}
          </Flexbox>
          <SessionList />
        </Flexbox>
      </DraggablePanelBody>
    </FolderPanel>
  );
});
