import { ProviderConfigProps } from './components/ProviderConfig';

export interface ProviderItem extends Omit<ProviderConfigProps, 'id'> {
  id: string;
}
