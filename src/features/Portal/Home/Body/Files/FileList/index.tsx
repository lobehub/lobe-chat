import { Avatar, Icon, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { InboxIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import Balancer from 'react-wrap-balancer';

import SkeletonLoading from '@/components/Loading/SkeletonLoading';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import FileItem from './Item';

const FileList = () => {
  const { t } = useTranslation('portal');
  const files = useChatStore(chatSelectors.currentUserFiles, isEqual);
  const theme = useTheme();
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);

  return !isCurrentChatLoaded ? (
    <Flexbox gap={12} paddingInline={12}>
      <SkeletonLoading />
    </Flexbox>
  ) : files.length === 0 ? (
    <Center
      gap={8}
      paddingBlock={24}
      style={{ border: `1px dashed ${theme.colorSplit}`, borderRadius: 8, marginInline: 12 }}
    >
      <Avatar
        avatar={<Icon icon={InboxIcon} size={'large'} />}
        background={theme.colorFillTertiary}
        size={48}
      />
      <Balancer>
        <Text type={'secondary'}>{t('emptyKnowledgeList')}</Text>
      </Balancer>
    </Center>
  ) : (
    <Flexbox gap={12} paddingInline={12}>
      {files.map((m) => (
        <FileItem {...m} key={m.id} />
      ))}
    </Flexbox>
  );
};

export default FileList;
