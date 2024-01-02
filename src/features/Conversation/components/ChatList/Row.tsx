import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { ListRowRenderer } from 'react-virtualized/dist/es/List';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const cache = new CellMeasurerCache({
  defaultHeight: 50,
});
export const Row = memo<ListRowRenderer>(({ parent, index, key, isScrolling, style }) => {
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const data = useChatStore(chatSelectors.currentChatsWithGuideMessage(meta), isEqual);
  console.log(data[index]);

  return (
    <CellMeasurer cache={cache} key={key} parent={parent} rowIndex={index}>
      {({ measure, registerChild }) => (
        <div ref={registerChild} style={style}>
          123
        </div>
      )}
    </CellMeasurer>
  );
});
