import { ActionIcon } from '@lobehub/ui';
import { Skeleton, Typography } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';
import { oneLineEllipsis } from '@/styles';

const Header = () => {
  const [closeFilePreview, previewFileId] = useChatStore((s) => [
    s.closeFilePreview,
    chatPortalSelectors.previewFileId(s),
  ]);

  const useFetchFileItem = useFileStore((s) => s.useFetchFileItem);

  const { data, isLoading } = useFetchFileItem(previewFileId);

  return (
    <Flexbox align={'center'} gap={4} horizontal>
      <ActionIcon icon={ArrowLeft} onClick={() => closeFilePreview()} />

      {isLoading ? (
        <Skeleton.Button active style={{ height: 28 }} />
      ) : (
        <Typography.Text className={oneLineEllipsis} style={{ fontSize: 16 }} type={'secondary'}>
          {data?.name}
        </Typography.Text>
      )}
    </Flexbox>
  );
};

export default Header;
