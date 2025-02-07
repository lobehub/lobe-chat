import { redirect } from 'next/navigation';

import { serverDB } from '@/database/server';
import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import FileManager from '@/features/FileManager';
import { PagePropsWithId } from '@/types/next';

export default async (props: PagePropsWithId) => {
  const params = await props.params;

  const item = await KnowledgeBaseModel.findById(serverDB, params.id);

  if (!item) return redirect('/repos');

  return <FileManager knowledgeBaseId={params.id} title={item.name} />;
};
