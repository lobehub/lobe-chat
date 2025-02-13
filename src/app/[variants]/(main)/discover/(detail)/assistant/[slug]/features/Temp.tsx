'use client';

import { Markdown } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { useTheme } from 'antd-style';
import { BotMessageSquare } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { DiscoverAssistantItem } from '@/types/discover';

import HighlightBlock from '../../../features/HighlightBlock';

interface ConversationExampleProps extends FlexboxProps {
  data: DiscoverAssistantItem;
  identifier: string;
  mobile?: boolean;
}

const ConversationExample = memo<ConversationExampleProps>(({ data }) => {
  const { t } = useTranslation('discover');
  const theme = useTheme();

  return (
    <HighlightBlock
      avatar={data?.meta.avatar}
      icon={BotMessageSquare}
      justify={'space-between'}
      style={{ background: theme.colorBgContainer }}
      title={t('assistants.systemRole')}
    >
      <Flexbox paddingInline={16}>
        {data.config.systemRole ? (
          <Markdown fontSize={theme.fontSize}>{data.config.systemRole}</Markdown>
        ) : (
          <Skeleton paragraph={{ rows: 4 }} title={false} />
        )}
      </Flexbox>
    </HighlightBlock>
  );
});

export default ConversationExample;
