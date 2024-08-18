import { memo } from 'react';

import DragUpload from '@/components/DragUpload';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import FileItemList from './FileList';

const FilePreview = memo(() => {
  const model = useAgentStore(agentSelectors.currentAgentModel);

  const canUploadImage = useUserStore(modelProviderSelectors.isModelEnabledUpload(model));

  const [uploadFiles] = useFileStore((s) => [s.uploadChatFiles]);

  const upload = async (fileList: FileList | File[] | undefined) => {
    if (!fileList || fileList.length === 0) return;

    // Filter out files that are not images if the model does not support image uploads
    const files = Array.from(fileList).filter((file) => {
      if (canUploadImage) return true;

      return !file.type.startsWith('image');
    });

    uploadFiles(files);
  };

  return (
    <>
      <DragUpload onUploadFiles={upload} />
      <FileItemList />
    </>
  );
});

export default FilePreview;
