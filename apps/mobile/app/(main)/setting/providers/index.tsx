import { FlatList, View } from 'react-native';

import { DEFAULT_MODEL_PROVIDER_LIST } from '../providers/modelProviders';
import { ModelProviderCard } from '@/types/llm';
import { useStyles } from './styles';

import ProviderCard from './components/ProviderCard';

const ProviderList = () => {
  const { styles } = useStyles();
  return (
    <View style={styles.container}>
      <FlatList
        data={DEFAULT_MODEL_PROVIDER_LIST}
        keyExtractor={(item: ModelProviderCard) => item.id}
        renderItem={({ item }: { item: ModelProviderCard }) => <ProviderCard provider={item} />}
      />
    </View>
  );
};

export default ProviderList;
