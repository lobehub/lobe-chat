import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Head from './Head';
import Menu from './Menu';

type Props = { id: string; name: string };

const ComposeMenu = memo<Props>(({ id, name }) => (
  <Flexbox gap={16} height={'100%'} paddingInline={12} style={{ paddingTop: 12 }}>
    <Head name={name} />
    <Menu id={id} />
  </Flexbox>
));

ComposeMenu.displayName = 'ComposeMenu';

export default ComposeMenu;
