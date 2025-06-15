import { Block } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useDetailContext } from '../../DetailProvider';
import KnowledgeItem from './KnowledgeItem';

const Knowledge = memo(() => {
  const { config } = useDetailContext();

  if (!config?.knowledgeBases?.length)
    return (
      <Block variant={'outlined'}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Block>
    );

  return (
    <Flexbox gap={8}>
      {config?.knowledgeBases.map((item) => (
        <KnowledgeItem
          avatar={item.avatar || item.id}
          description={item?.description || ''}
          key={item.id}
          title={item.name}
        />
      ))}
    </Flexbox>
  );
});

export default Knowledge;
