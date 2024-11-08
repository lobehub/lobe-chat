import { Markdown } from '@lobehub/ui';
import { Flexbox } from 'react-layout-kit';

import { ChatMessage } from '@/types/message';

import HistoryDivider from '../../components/HistoryDivider';

const History = ({ content }: ChatMessage) => {
  return (
    <Flexbox paddingInline={24}>
      <HistoryDivider enable />
      <Markdown>{content}</Markdown>
    </Flexbox>
  );
};

export default History;
