import { Flexbox } from 'react-layout-kit';

import Head from './Head';
import Menu from './Menu';

interface Params {
  id: string;
}

type Props = { params: Params };

const MenuPage = ({ params }: Props) => {
  const id = params.id;

  return (
    <Flexbox gap={16} height={'100%'} paddingInline={12} style={{ paddingTop: 12 }}>
      <Head id={id} />
      <Menu id={id} />
    </Flexbox>
  );
};

MenuPage.displayName = 'Menu';

export default MenuPage;
