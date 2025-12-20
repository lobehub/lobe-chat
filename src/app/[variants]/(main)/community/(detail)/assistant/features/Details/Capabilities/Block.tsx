import { Tag } from '@lobehub/ui';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Title from '../../../../../features/Title';

interface BlockProps {
  children?: ReactNode;
  count: number;
  desc: string;
  id?: string;
  title: string;
}

const Block = memo<BlockProps>(({ title, count, desc, children, id }) => {
  return (
    <Flexbox gap={8}>
      <Title id={id} tag={<Tag>{count}</Tag>}>
        {title}
      </Title>
      <p style={{ marginBottom: 24 }}>{desc}</p>
      {children}
    </Flexbox>
  );
});

export default Block;
