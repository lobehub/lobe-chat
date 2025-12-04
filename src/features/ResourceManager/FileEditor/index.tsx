'use client';

import { ActionIcon } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/chat';
import { XIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Breadcrumb from '../FileExplorer/Header/Breadcrumb';
import FileContent from './FileContent';

interface PreviewModeProps {
  category?: string;
  currentViewItemId: string;
  fileName?: string;
  knowledgeBaseId?: string;
  onBack: () => void;
}

const FileEditor = memo<PreviewModeProps>(
  ({ category, currentViewItemId, fileName, knowledgeBaseId, onBack }) => {
    const { t } = useTranslation('common');

    return (
      <Flexbox height={'100%'}>
        <ChatHeader
          left={
            <Flexbox align={'center'} gap={4} horizontal style={{ minHeight: 32 }}>
              <ActionIcon icon={XIcon} onClick={onBack} title={t('back')} />
              <Flexbox align={'center'} style={{ marginLeft: 12 }}>
                <Breadcrumb
                  category={category}
                  fileName={fileName}
                  knowledgeBaseId={knowledgeBaseId}
                />
              </Flexbox>
            </Flexbox>
          }
          styles={{
            left: { padding: 0 },
          }}
        />
        <Flexbox flex={1} style={{ backgroundColor: 'blue', overflow: 'hidden', paddingTop: 48 }}>
          <FileContent fileId={currentViewItemId} />
        </Flexbox>
      </Flexbox>
    );
  },
);

export default FileEditor;
