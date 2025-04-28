'use client';

import { Icon } from '@lobehub/ui';
import { ChatList } from '@lobehub/ui/chat';
import { ChatInputArea, ChatSendButton } from '@lobehub/ui/mobile';
import { useTheme } from 'antd-style';
import { BotMessageSquare, LoaderCircle } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverAssistantItem } from '@/types/discover';

import HighlightBlock from '../../../../features/HighlightBlock';
import TopicList from './TopicList';

interface ConversationExampleProps extends FlexboxProps {
  data?: DiscoverAssistantItem;
  identifier: string;
  mobile?: boolean;
}

const ConversationExample = memo<ConversationExampleProps>(({ data }) => {
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <HighlightBlock
      avatar={data?.meta.avatar}
      height={720}
      icon={BotMessageSquare}
      justify={'space-between'}
      style={{ background: theme.colorFillQuaternary }}
      title={t('assistants.try')}
    >
      {!data ? (
        <Center flex={1} width={'100%'}>
          <Icon icon={LoaderCircle} size={'large'} spin />
        </Center>
      ) : (
        <Flexbox
          flex={1}
          paddingBlock={16}
          style={{ overflowX: 'hidden', overflowY: 'auto' }}
          width={'100%'}
        >
          <ChatList
            data={[
              {
                content: [t('assistants.conversation.l1', { name: data.meta.title }), '😎😋'].join(
                  ' ',
                ),
                createAt: 1_686_437_950_084,
                id: '1',
                meta: {
                  avatar: data.meta.avatar,
                  title: data.meta.title,
                },
                role: 'assistant',
                updateAt: 1_686_437_950_084,
              },
              {
                content: [t('assistants.conversation.l2') + data.meta.description].join(' '),
                createAt: 1_686_437_950_084,
                id: '2',
                meta: {
                  avatar: data.meta.avatar,
                  title: data.meta.title,
                },
                role: 'assistant',
                updateAt: 1_686_437_950_084,
              },
              {
                content: [t('assistants.conversation.l3'), '👇✨'].join(' '),
                createAt: 1_686_437_950_084,
                id: '3',
                meta: {
                  avatar: data.meta.avatar,
                  title: data.meta.title,
                },
                role: 'assistant',
                updateAt: 1_686_437_950_084,
              },
            ]}
            renderActions={{
              default: () => null,
            }}
            renderMessages={{
              default: ({ id, editableContent }) => <div id={id}>{editableContent}</div>,
            }}
          />
        </Flexbox>
      )}
      <Flexbox flex={'none'}>
        {data?.examples && data.examples?.length > 0 && <TopicList data={data?.examples} />}
        <ChatInputArea
          style={{ background: 'none', border: 'none' }}
          textAreaRightAddons={<ChatSendButton />}
        />
      </Flexbox>
    </HighlightBlock>
  );
});

export default ConversationExample;
