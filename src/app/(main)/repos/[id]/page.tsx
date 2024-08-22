import { redirect } from 'next/navigation';

import { KnowledgeBaseModel } from '@/database/server/models/knowledgeBase';
import FileManager from '@/features/FileManager';

interface Params {
  id: string;
}

type Props = { params: Params };

export default async ({ params }: Props) => {
  const item = await KnowledgeBaseModel.findById(params.id);

  if (!item) return redirect('/repos');

  return <FileManager knowledgeBaseId={params.id} title={item.name} />;
};
