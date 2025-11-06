import { AiProviderListItem } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { Link } from 'expo-router';
import { memo } from 'react';

import { Cell } from '@/components';

interface ProviderCardProps {
  provider: AiProviderListItem;
}

const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  const { id, name } = provider;

  return (
    <Link asChild href={`/setting/providers/${id}`}>
      <Cell
        icon={<ProviderIcon provider={id} size={28} type={'avatar'} />}
        iconSize={28}
        title={name}
      />
    </Link>
  );
});

export default ProviderCard;
