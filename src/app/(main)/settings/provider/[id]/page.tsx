import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { PagePropsWithId } from '@/types/next';

import ProviderConfig from '../components/ProviderConfig';

const Page = async (props: PagePropsWithId) => {
  const params = await props.params;

  const card = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === params.id);
  if (!card) return <div>not found</div>;

  return (
    <div>
      <ProviderConfig {...card} />
    </div>
  );
};

export default Page;
