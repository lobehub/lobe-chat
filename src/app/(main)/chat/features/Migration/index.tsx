'use client';

import { Spin } from 'antd';
import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';

import { isServerMode } from '@/const/version';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { V2DBReader } from './DBReader';

const Modal = dynamic(() => import('./Modal'), { loading: () => <Spin fullscreen />, ssr: false });

const Migration = memo(() => {
  const [dbState, setDbState] = useState(null);
  const [open, setOpen] = useState(false);

  const isPgliteInited = useGlobalStore(systemStatusSelectors.isPgliteInited);

  const checkMigration = async () => {
    const isMigrated = localStorage.getItem('V2DB_IS_MIGRATED');
    // if db have migrated already, don't show modal
    if (isMigrated || isServerMode) return;

    const dbReader = new V2DBReader([
      'messages',
      'files',
      'plugins',
      'sessionGroups',
      'sessions',
      'topics',
      'users',
    ]);
    const data = await dbReader.readAllData();
    console.log('migration data:', data);
    const state = await dbReader.convertToImportData(data);
    console.log('import state', state);
    setDbState(state as any);
    setOpen(true);
  };

  useEffect(() => {
    if (isPgliteInited) checkMigration();
  }, [isPgliteInited]);

  return open && <Modal open={open} setOpen={setOpen} state={dbState} />;
});

export default Migration;
