import { memo } from 'react';

import type { UserMemoryIdentity } from '@/types/index';

import { MasonryView as GenericMasonryView } from '../../../../features/MasonryView';
import IdentityCard from './IdentityCard';

interface MasonryViewProps {
  identities: UserMemoryIdentity[];
  onClick?: (identity: UserMemoryIdentity) => void;
  onDelete?: (id: string) => void;
}

const MasonryView = memo<MasonryViewProps>(({ identities, onClick, onDelete }) => {
  return (
    <GenericMasonryView
      defaultColumnCount={3}
      items={identities}
      renderItem={(identity) => (
        <IdentityCard identity={identity} onClick={() => onClick?.(identity)} onDelete={onDelete} />
      )}
    />
  );
});

export default MasonryView;
