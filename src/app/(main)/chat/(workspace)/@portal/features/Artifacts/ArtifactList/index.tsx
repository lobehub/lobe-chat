import { Avatar, Icon } from '@lobehub/ui';
import { Skeleton, Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Origami } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import Balancer from 'react-wrap-balancer';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import ArtifactItem from './Item';

const ArtifactList = () => {
  const { t } = useTranslation('portal');
  const messages = useChatStore(chatSelectors.currentToolMessages, isEqual);
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);

  const theme = useTheme();
  return !isCurrentChatLoaded ? (
    <Flexbox gap={12} paddingInline={12}>
      {[1, 1, 1, 1, 1, 1].map((key, index) => (
        <Skeleton.Button
          active
          block
          key={`${key}-${index}`}
          style={{ borderRadius: 8, height: 68 }}
        />
      ))}
    </Flexbox>
  ) : messages.length === 0 ? (
    <Center
      gap={8}
      paddingBlock={24}
      style={{ border: `1px dashed ${theme.colorSplit}`, borderRadius: 8, marginInline: 12 }}
    >
      <Avatar
        avatar={<Icon icon={Origami} size={'large'} />}
        background={theme.colorFillTertiary}
        size={48}
      />
      <Balancer>
        <Typography.Link type={'secondary'}>{t('emptyArtifactList')}</Typography.Link>
      </Balancer>
    </Center>
  ) : (
    <Flexbox gap={12} paddingInline={12}>
      {messages.map((m) => (
        <ArtifactItem
          identifier={m.plugin?.identifier}
          key={m.id}
          messageId={m.id}
          payload={m.plugin}
        />
      ))}
    </Flexbox>
  );
};

export default ArtifactList;
