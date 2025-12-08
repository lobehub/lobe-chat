'use client';

import { ActionIcon } from '@lobehub/ui';
import { XIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useResourceManagerStore } from '@/app/[variants]/(main)/resource/features/store';
import NavHeader from '@/features/NavHeader';

import Breadcrumb from '../Explorer/Header/Breadcrumb';
import FileContent from './FileContent';

interface PreviewModeProps {
  category?: string;
  fileName?: string;
  knowledgeBaseId?: string;
  onBack?: () => void;
}

/**
 * View or Edit a file
 *
 * It's a un-reusable component for business logic only.
 * So we depend on context, not props.
 */
const FileEditor = memo<PreviewModeProps>(({ fileName, knowledgeBaseId }) => {
  const { t } = useTranslation('common');

  const [currentViewItemId, category, setMode, setCurrentViewItemId] = useResourceManagerStore(
    (s) => [s.currentViewItemId, s.category, s.setMode, s.setCurrentViewItemId],
  );

  return (
    <Flexbox height={'100%'}>
      <NavHeader
        left={
          <Flexbox align={'center'} gap={4} horizontal style={{ minHeight: 32 }}>
            <Flexbox align={'center'} style={{ marginLeft: 12 }}>
              <Breadcrumb
                category={category}
                fileName={fileName}
                knowledgeBaseId={knowledgeBaseId}
              />
            </Flexbox>
          </Flexbox>
        }
        right={
          <Flexbox align={'center'} gap={4} horizontal style={{ minHeight: 32 }}>
            <ActionIcon
              icon={XIcon}
              onClick={() => {
                setMode('explorer');
                setCurrentViewItemId(undefined);
              }}
              title={t('back')}
            />
          </Flexbox>
        }
        styles={{
          left: { padding: 0 },
        }}
      />
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <FileContent fileId={currentViewItemId} />
      </Flexbox>
    </Flexbox>
  );
});

export default FileEditor;
