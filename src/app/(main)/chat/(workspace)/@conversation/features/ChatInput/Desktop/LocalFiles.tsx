import { memo } from 'react';

import DragUpload from '@/components/DragUpload';
import { EditableFileList } from '@/features/FileList';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

interface LocalFilesProps {
  padding?: number | string;
}

const LocalFiles = memo<LocalFilesProps>(({ padding }) => {
  const model = useAgentStore(agentSelectors.currentAgentModel);

  const enabledFiles = useUserStore(modelProviderSelectors.isModelEnabledFiles(model));
  const canUpload = useUserStore(modelProviderSelectors.isModelEnabledUpload(model));

  const inputFilesList = useFileStore((s) => s.inputFilesList);
  const uploadFile = useFileStore((s) => s.uploadFile);

  const uploadImages = async (fileList: FileList | undefined) => {
    if (!fileList || fileList.length === 0) return;

    const pools = Array.from(fileList).map(async (file) => {
      // skip none-file items
      if (!file.type.startsWith('image') && !enabledFiles) return;
      await uploadFile(file);
    });

    await Promise.all(pools);
  };

  return (
    canUpload && (
      <>
        <DragUpload enabledFiles={enabledFiles} onUploadFiles={uploadImages} />
        <EditableFileList items={inputFilesList} padding={padding ?? 0} />
      </>
    )
  );
});

export default LocalFiles;
