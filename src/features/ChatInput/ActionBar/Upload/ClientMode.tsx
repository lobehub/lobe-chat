import { ActionIcon } from '@lobehub/ui';
import { Upload } from 'antd';
import { FileUp, LucideImage } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/slices/chat';
import { useFileStore } from '@/store/file';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

const FileUpload = memo(() => {
  const { t } = useTranslation('chat');

  const upload = useFileStore((s) => s.uploadChatFiles);

  const model = useAgentStore(agentSelectors.currentAgentModel);
  const [canUpload, enabledFiles] = useUserStore((s) => [
    modelProviderSelectors.isModelEnabledUpload(model)(s),
    modelProviderSelectors.isModelEnabledFiles(model)(s),
  ]);

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
