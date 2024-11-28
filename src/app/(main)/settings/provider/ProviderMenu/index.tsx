import { Flexbox } from 'react-layout-kit';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

import All from './All';
import ProviderItem from './Item';

const ProviderMenu = () => {
  return (
    <Flexbox padding={8} style={{ overflow: 'scroll' }} width={320}>
      <All />
      {DEFAULT_MODEL_PROVIDER_LIST.map((item) => (
        <ProviderItem {...item} key={item.id} />
      ))}
    </Flexbox>
  );
};
export default ProviderMenu;
