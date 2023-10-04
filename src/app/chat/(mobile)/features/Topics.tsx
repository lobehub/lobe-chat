import { memo } from 'react';

import { InspectorContent } from '../../components/Inspector';
import Mobile from '../../components/Inspector/Mobile';

const Topics = memo(() => (
  <Mobile>
    <InspectorContent />
  </Mobile>
));

export default Topics;
