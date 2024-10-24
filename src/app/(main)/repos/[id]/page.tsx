import { redirect } from 'next/navigation';

import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import FileManager from '@/features/FileManager';

import { PageProps } from './type';

export default async (props: PageProps) => {
  const params = await props.params;

  const item = await KnowledgeBaseModel.findById(params.id);

  if (!item) return redirect('/repos');

  return <FileManager knowledgeBaseId={params.id} title={item.name} />;
};
