'use client';

import { Flexbox } from '@lobehub/ui';
import { type FC, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

import { useQuickNoteStore } from '@/store/quickNote';

import Sidebar from './Sidebar';
import { styles } from './style';
import { useQuickNotePersistenceLifecycle } from './useQuickNotePersistenceLifecycle';
import { useQuickNoteRouteAccess } from './useQuickNoteRouteAccess';

const NoteLayoutContent: FC = () => {
  const initNotes = useQuickNoteStore((s) => s.initNotes);

  useEffect(() => {
    initNotes();
  }, [initNotes]);

  useQuickNotePersistenceLifecycle();

  return (
    <>
      <Sidebar />
      <Flexbox
        className={styles.mainContainer}
        flex={1}
        height={'100%'}
        style={{ overflow: 'hidden' }}
      >
        <Outlet />
      </Flexbox>
    </>
  );
};

const NoteLayout: FC = () => {
  const access = useQuickNoteRouteAccess();

  if (access === 'pending') return null;
  if (access === 'denied') return <Navigate replace to={'..'} />;
  return <NoteLayoutContent />;
};

export default NoteLayout;
