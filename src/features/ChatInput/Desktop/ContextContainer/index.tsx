import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import DragUpload from '@/components/DragUpload';
import { useModelSupportVision } from '@/hooks/useModelSupportVision';
import { useAgentStore } from '@/store/agent';
import { agentByIdSelectors } from '@/store/agent/selectors';
import { useFileStore } from '@/store/file';

import { useAgentId } from '../../hooks/useAgentId';
import ContextList from './ContextList';

/**
 * Contains the context item to be attached, such as file, image, text, etc.
 */
const ContextContainer = memo(() => {
  const agentId = useAgentId();
  const model = useAgentStore((s) => agentByIdSelectors.getAgentModelById(agentId)(s));
  const provider = useAgentStore((s) => agentByIdSelectors.getAgentModelProviderById(agentId)(s));

  const canUploadImage = useModelSupportVision(model, provider);

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
    <Flexbox paddingInline={8}>
      <DragUpload onUploadFiles={upload} />
      <ContextList />
    </Flexbox>
  );
});

export default ContextContainer;
