import { memo } from 'react';

import type { UserMemoryIdentity } from '@/types/index';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import IdentityCard from './IdentityCard';

interface MasonryViewProps {
  identities: UserMemoryIdentity[];
}

const MasonryView = memo<MasonryViewProps>(({ identities }) => {
  return (
    <GenericMasonryView
      defaultColumnCount={3}
      items={identities}
      renderItem={(identity) => <IdentityCard identity={identity} />}
    />
  );
});

export default MasonryView;
