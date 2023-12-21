import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { createStyles, useResponsive } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import LazyLoad from 'react-lazy-load';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSessionHydrated, useSessionStore } from '@/store/session';
import { SessionAction } from '@/store/session/slices/session/action';
import { LobeAgentSession } from '@/types/session';

import AddButton from './AddButton';
import SessionItem from './Item';
import SkeletonList from './SkeletonList';

const useStyles = createStyles(
  ({ css }) => css`
    min-height: 70px;
  `,
);

const getListStyle = (isDraggingOver: boolean) => ({
  paddingBottom: isDraggingOver ? 70 : 0,
  width: '100%',
});

interface Result {
  destination: {
    index: number;
  } | null;
  source: {
    index: number;
  };
}

const onDragEnd = (
  result: Result,
  dataSource: LobeAgentSession[],
  batchUpdateSessionsFn: SessionAction['batchUpdateSessions'],
) => {
  const sourceIndex = result.source.index;
  const destinationIndex = result.destination ? result.destination.index : null;
  if (destinationIndex === null) return;
  const step = destinationIndex - sourceIndex > 0 ? 1 : -1;
  dataSource[sourceIndex].sortId = destinationIndex;
  dataSource[destinationIndex].sortId = destinationIndex - step;
  for (let i = sourceIndex + step; i !== destinationIndex; i += step) {
    dataSource[i].sortId = i - step;
  }
  batchUpdateSessionsFn(dataSource.map((item) => ({ data: item, id: item.id })));
};

interface SessionListProps {
  dataSource: LobeAgentSession[];
}
const SessionList = memo<SessionListProps>(({ dataSource }) => {
  dataSource.sort((a, b) => (a.sortId ?? -1) - (b.sortId ?? -1));
  const [activeSession, switchSession, batchUpdateSessions] = useSessionStore((s) => [
    s.activeSession,
    s.switchSession,
    s.batchUpdateSessions,
  ]);
  const { styles } = useStyles();
  const isInit = useSessionHydrated();

  const { mobile } = useResponsive();

  return !isInit ? (
    <SkeletonList />
  ) : dataSource.length > 0 ? (
    <DragDropContext
      onDragEnd={async (result) => await onDragEnd(result, dataSource, batchUpdateSessions)}
    >
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {dataSource.map(({ id }, index) => (
              <Draggable draggableId={id} index={index} key={id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <LazyLoad className={styles} key={id}>
                      <Link
                        aria-label={id}
                        href={SESSION_CHAT_URL(id, mobile)}
                        onClick={(e) => {
                          e.preventDefault();
                          if (mobile) switchSession(id);
                          else activeSession(id);
                        }}
                      >
                        <SessionItem id={id} />
                      </Link>
                    </LazyLoad>
                  </div>
                )}
              </Draggable>
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  ) : (
    <AddButton />
  );
});

export default SessionList;
