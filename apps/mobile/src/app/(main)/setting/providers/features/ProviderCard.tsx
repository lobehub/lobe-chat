import { AiProviderListItem } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { useRouter } from 'expo-router';
import { memo } from 'react';

import { Cell } from '@/components';

interface ProviderCardProps {
  provider: AiProviderListItem;
}

const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  const router = useRouter();
  const { id, name } = provider;

  const handlePress = () => {
    router.push(`/setting/providers/${id}`);
  };

  return (
    <Cell
      icon={<ProviderIcon provider={id} size={28} type={'avatar'} />}
      iconSize={28}
      onPress={handlePress}
      title={name}
    />
  );
});

export default ProviderCard;
