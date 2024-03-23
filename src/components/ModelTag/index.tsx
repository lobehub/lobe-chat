import { Tag } from '@lobehub/ui';
import { memo } from 'react';

import ModelIcon from './ModelIcon';

interface ModelTagProps {
  model: string;
}
const ModelTag = memo<ModelTagProps>(({ model }) => (
  <Tag icon={<ModelIcon model={model} />}>{model}</Tag>
));

export default ModelTag;
