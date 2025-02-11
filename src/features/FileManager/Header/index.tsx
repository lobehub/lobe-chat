'use client';

import { ActionIcon } from '@lobehub/ui';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DESKTOP_HEADER_ICON_SIZE, FOLDER_WIDTH } from '@/const/layoutTokens';
import { useDirection } from '@/hooks/useDirection';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import FilesSearchBar from './FilesSearchBar';
import UploadFileButton from './UploadFileButton';

const Header = memo<{ knowledgeBaseId?: string }>(({ knowledgeBaseId }) => {
  const showFilePanel = useGlobalStore(systemStatusSelectors.showFilePanel);
  const updateSystemStatus = useGlobalStore((s) => s.updateSystemStatus);
  const direction = useDirection();

  return (
    <Flexbox distribution={'space-between'} horizontal paddingBlock={12} paddingInline={24}>
      <Flexbox gap={8} horizontal>
        <ActionIcon
          icon={
            showFilePanel
              ? direction === 'rtl'
                ? PanelRightClose
                : PanelLeftClose
              : direction === 'rtl'
                ? PanelRightOpen
                : PanelLeftOpen
          }
          onClick={() => {
            updateSystemStatus({
              filePanelWidth: showFilePanel ? 0 : FOLDER_WIDTH,
              showFilePanel: !showFilePanel,
            });
          }}
          size={DESKTOP_HEADER_ICON_SIZE}
        />
        <FilesSearchBar />
      </Flexbox>
      <UploadFileButton knowledgeBaseId={knowledgeBaseId} />
    </Flexbox>
  );
});

export default Header;
