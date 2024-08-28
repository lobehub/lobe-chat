import { Icon, Markdown } from '@lobehub/ui';
import { Segmented } from 'antd';
import { BoltIcon, FileIcon } from 'lucide-react';
import { useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/CircleLoading';
import FileViewer from '@/features/FileViewer';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useFileStore } from '@/store/file';

const FilePreview = () => {
  const previewFileId = useChatStore(chatPortalSelectors.previewFileId);
  const chunkText = useChatStore(chatPortalSelectors.chunkText);
  const useFetchFileItem = useFileStore((s) => s.useFetchFileItem);

  const [tab, setTab] = useState('chunk');
  const { data, isLoading } = useFetchFileItem(previewFileId);

  if (isLoading) return <Loading />;
  if (!data) return;

  const showChunk = tab === 'chunk' && !!chunkText;
  return (
    <Flexbox
      height={'100%'}
      paddingBlock={'0 4px'}
      paddingInline={4}
      style={{ borderRadius: 4, overflow: 'hidden' }}
    >
      {chunkText && (
        <Segmented
          block
          onChange={setTab}
          options={[
            { icon: <Icon icon={BoltIcon} />, label: '分块', value: 'chunk' },
            { icon: <Icon icon={FileIcon} />, label: '文件', value: 'file' },
          ]}
          value={tab}
        />
      )}

      {showChunk ? (
        <Markdown style={{ overflow: 'scroll', paddingInline: 8 }}>{chunkText}</Markdown>
      ) : (
        <Flexbox flex={1} paddingBlock={8} style={{ overflow: 'scroll' }}>
          <FileViewer {...data} />
        </Flexbox>
      )}
    </Flexbox>
  );
};

export default FilePreview;
