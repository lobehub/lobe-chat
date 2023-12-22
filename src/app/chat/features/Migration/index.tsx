'use client';

import { Spin } from 'antd';
import { createStore, getMany } from 'idb-keyval';
import dynamic from 'next/dynamic';
import { PropsWithChildren, memo, useEffect, useState } from 'react';

import { MIGRATE_KEY, V1DB_NAME, V1DB_TABLE_NAME } from './const';

const Modal = dynamic(() => import('./Modal'), { loading: () => <Spin fullscreen />, ssr: false });

/**
 * 这个组件的作用是在应用启动时检查数据库迁移的状态.
 *
 * 如果满足特定条件（数据库已经迁移，或者是新用户，即数据库不存在状态键），则不会有任何动作。
 *
 * 如果数据库存在且需要迁移，它会设置状态并显示一个模态窗口来通知用户或处理迁移。
 *
 * 同时，它也会渲染任何作为子元素传递给它的内容。
 */
const Migration = memo<PropsWithChildren>(({ children }) => {
  const [dbState, setDbState] = useState(null);
  const [open, setOpen] = useState(false);

  const checkMigration = async () => {
    const [state, migrated] = await getMany(
      ['state', MIGRATE_KEY],
      createStore(V1DB_NAME, V1DB_TABLE_NAME),
    );

    // if db have migrated already, don't show modal
    if (migrated) return;

    // if db doesn't exist state key,it means a new user
    if (!state) return;

    setDbState(state);
    setOpen(true);
  };

  useEffect(() => {
    checkMigration();
  }, []);

  return (
    <>
      {open && <Modal open={open} setOpen={setOpen} state={dbState} />}
      {children}
    </>
  );
});

export default Migration;
