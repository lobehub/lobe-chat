import { ActionIcon, Icon } from '@lobehub/ui';
import { Upload } from 'antd';
import { useTheme } from 'antd-style';
import { LucideImage, LucideLoader2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { useFileStore } from '@/store/file';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const FileUpload = memo(() => {
  const { t } = useTranslation('chat');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const upload = useFileStore((s) => s.uploadFile);

  const canUpload = useSessionStore(agentSelectors.modelHasVisionAbility);

  if (!canUpload) return null;

  return (
    <Upload
      accept="image/*"
      beforeUpload={async (file) => {
        setLoading(true);

        await upload(file);

        setLoading(false);
        return false;
      }}
      multiple={true}
      showUploadList={false}
    >
      {loading ? (
        <Center height={36} width={36}>
          <Icon
            color={theme.colorTextSecondary}
            icon={LucideLoader2}
            size={{ fontSize: 18 }}
            spin
          ></Icon>
        </Center>
      ) : (
        <ActionIcon icon={LucideImage} placement={'bottom'} title={t('upload.actionTooltip')} />
      )}
    </Upload>
  );
});

export default FileUpload;
