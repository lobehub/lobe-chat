import { ActionIcon } from '@lobehub/ui';
import { Upload } from 'antd';
import { FileUp, LucideImage } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useFileStore } from '@/store/file';
import { useModelSupportFiles } from "@/hooks/useModelSupportFiles";
import { useModelSupportVision } from "@/hooks/useModelSupportVision";

const FileUpload = memo(() => {
  const { t } = useTranslation('chat');

  const upload = useFileStore((s) => s.uploadChatFiles);

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const provider = useAgentStore(agentSelectors.currentAgentModelProvider);

  const enabledFiles = useModelSupportFiles(model, provider);
  const supportVision = useModelSupportVision(model, provider);
  const canUpload = enabledFiles || supportVision;

  return (
    <Upload
      accept={enabledFiles ? undefined : 'image/*'}
      beforeUpload={async (file) => {
        await upload([file]);

        return false;
      }}
      disabled={!canUpload}
      multiple={true}
      showUploadList={false}
    >
      <ActionIcon
        disable={!canUpload}
        icon={enabledFiles ? FileUp : LucideImage}
        placement={'bottom'}
        title={t(
          canUpload
            ? enabledFiles
              ? 'upload.clientMode.actionFiletip'
              : 'upload.clientMode.actionTooltip'
            : 'upload.clientMode.disabled',
        )}
      />
    </Upload>
  );
});

export default FileUpload;
