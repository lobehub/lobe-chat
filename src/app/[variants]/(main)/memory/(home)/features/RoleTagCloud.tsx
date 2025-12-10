import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { QueryTagsResult } from '@/database/models/userMemory';

interface RoleTagCloudProps {
  tags: QueryTagsResult[];
}

const RoleTagCloud = memo<RoleTagCloudProps>(({ tags }) => {
  return (
    <Flexbox>
      {tags.map((item, index) => (
        <Text fontSize={item.count} key={index}>
          {item.tag}
        </Text>
      ))}
    </Flexbox>
  );
});

export default RoleTagCloud;
