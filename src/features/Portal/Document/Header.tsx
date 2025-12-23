'use client';

import { ActionIcon, Flexbox, Text } from '@lobehub/ui';
import { cx } from 'antd-style';
import { ArrowLeft } from 'lucide-react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';
import { useNotebookStore } from '@/store/notebook';
import { notebookSelectors } from '@/store/notebook/selectors';
import { oneLineEllipsis } from '@/styles';

const Header = () => {
  const [topicId, documentId, closeDocument] = useChatStore((s) => [
    s.activeTopicId,
    chatPortalSelectors.portalDocumentId(s),
    s.closeDocument,
  ]);

  const document = useNotebookStore(notebookSelectors.getDocumentById(topicId, documentId));

  if (!document) return null;

  return (
    <Flexbox align={'center'} flex={1} gap={12} horizontal justify={'space-between'} width={'100%'}>
      <Flexbox align={'center'} gap={4} horizontal>
        <ActionIcon icon={ArrowLeft} onClick={closeDocument} size={'small'} />
        <Text className={cx(oneLineEllipsis)} type={'secondary'}>
          {document.title}
        </Text>
      </Flexbox>
    </Flexbox>
  );
};

export default Header;
