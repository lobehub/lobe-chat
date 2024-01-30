import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import ModelProviderIcon from '@/components/ModelProviderIcons';

interface ModelTagProps {
  name: string;
  provider?: string;
}
const ModelTag = memo<ModelTagProps>(({ provider, name }) => {
  return <Tag icon={<ModelProviderIcon provider={provider} />}>{name}</Tag>;
});

export default ModelTag;
