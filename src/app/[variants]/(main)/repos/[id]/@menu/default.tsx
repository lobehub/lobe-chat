import { notFound } from 'next/navigation';
import { Flexbox } from 'react-layout-kit';

import { KnowledgeBaseModel } from '@/database/models/knowledgeBase';
import { serverDB } from '@/database/server';

import Head from './Head';
import Menu from './Menu';

interface Params {
  id: string;
}

type Props = { params: Params };

const MenuPage = async ({ params }: Props) => {
  const id = params.id;
  const item = await KnowledgeBaseModel.findById(serverDB, params.id);

  if (!item) return notFound();

  return (
    <Flexbox gap={16} height={'100%'} paddingInline={12} style={{ paddingTop: 12 }}>
      <Head name={item.name} />
      <Menu id={id} />
    </Flexbox>
  );
};

MenuPage.displayName = 'Menu';

export default MenuPage;
