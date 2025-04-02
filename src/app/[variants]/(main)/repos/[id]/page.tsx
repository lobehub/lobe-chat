import { redirect } from 'next/navigation';

import { KnowledgeBaseModel } from '@/database/models/knowledgeBase';
import { serverDB } from '@/database/server';
import FileManager from '@/features/FileManager';
import { PagePropsWithId } from '@/types/next';

export default async (props: PagePropsWithId) => {
  const params = await props.params;

  const item = await KnowledgeBaseModel.findById(serverDB, params.id);

  if (!item) return redirect('/repos');

  return <FileManager knowledgeBaseId={params.id} title={item.name} />;
};
