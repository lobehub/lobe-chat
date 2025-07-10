import { redirect } from 'next/navigation';
import { Flexbox } from 'react-layout-kit';

import { KnowledgeBaseModel } from '@/database/models/knowledgeBase';
import { getServerDB } from '@/database/server';
import FileManager from '@/features/FileManager';
import FilePanel from '@/features/FileSidePanel';
import { PagePropsWithId } from '@/types/next';

import Menu from './features/Menu';

export default async (props: PagePropsWithId) => {
  const params = await props.params;

  const serverDB = await getServerDB();
  const item = await KnowledgeBaseModel.findById(serverDB, params.id);
  if (!item) return redirect('/repos');

  return (
    <>
      <FilePanel>
        <Menu id={params.id} name={item.name} />
      </FilePanel>
      <Flexbox flex={1} style={{ overflow: 'hidden', position: 'relative' }}>
        <FileManager knowledgeBaseId={params.id} title={item.name} />
      </Flexbox>
    </>
  );
};
