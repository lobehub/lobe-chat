import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

import ClientMode from './ClientMode';
import ProviderDetail from './index';

const Page = (props: {
  params: {
    id?: string
  }
}) => {
  const params = props.params;

  const builtinProviderCard = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === params.id);
  // if builtin provider
  if (!!builtinProviderCard) return <ProviderDetail source={'builtin'} {...builtinProviderCard} />;

  if (params?.id) {
    return <ClientMode id={params?.id} />;
  }
  return null
};

export default Page;

export const dynamic = 'force-static';
