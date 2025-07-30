import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ListGroup } from '@/components';
import { ModelProviderCard } from '@/types/llm';

import ProviderLogo from '../ProviderLogo';
import { useStyles } from './style';

interface ProviderCardProps {
  provider: ModelProviderCard;
}

const ProviderCard = memo<ProviderCardProps>(({ provider }) => {
  const { styles } = useStyles();
  const router = useRouter();
  const { name, description, id } = provider;

  const handlePress = () => {
    if (id === 'openai') {
      router.push('/setting/providers/openai');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={id === 'openai' ? 0.7 : 1} onPress={handlePress}>
        <ListGroup>
          <View style={styles.content}>
            <View style={styles.body}>
              <View style={styles.header}>
                <ProviderLogo provider={id} />
                <Text style={styles.title}>{name}</Text>
              </View>
              <Text numberOfLines={2} style={styles.desc}>
                {description}
              </Text>
            </View>
          </View>
        </ListGroup>
      </TouchableOpacity>
    </View>
  );
});

export default ProviderCard;
