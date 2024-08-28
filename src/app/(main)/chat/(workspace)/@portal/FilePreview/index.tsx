import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/CircleLoading';
import FileViewer from '@/features/FileViewer';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';

const FilePreview = () => {
  const previewFileId = useChatStore(chatPortalSelectors.previewFileId);
  const useFetchFileItem = useFileStore((s) => s.useFetchFileItem);

  const { data, isLoading } = useFetchFileItem(previewFileId);

  if (isLoading) return <Loading />;
  if (!data) return;

  console.log(data);
  return (
    <Flexbox height={'100%'} paddingBlock={'0 4px'} paddingInline={4} style={{ borderRadius: 4 }}>
      <FileViewer {...data} />
    </Flexbox>
  );
};

export default FilePreview;
