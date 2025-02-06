import { redirect } from 'next/navigation';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { isServerMode } from '@/const/version';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { serverDB } from '@/database/server';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import { PagePropsWithId } from '@/types/next';
import { ProviderConfig } from '@/types/user/settings';
import { getUserAuth } from '@/utils/server/auth';

import ClientMode from './ClientMode';
import ProviderDetail from './index';

const Page = async (props: PagePropsWithId) => {
  const params = await props.params;

  const builtinProviderCard = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === params.id);
  // if builtin provider
  if (!!builtinProviderCard) return <ProviderDetail source={'builtin'} {...builtinProviderCard} />;

  // if user custom provider
  if (isServerMode) {
    const { userId } = await getUserAuth();

    const { aiProvider } = getServerGlobalConfig();
    const aiInfraRepos = new AiInfraRepos(
      serverDB,
      userId!,
      aiProvider as Record<string, ProviderConfig>,
    );

    const userCard = await aiInfraRepos.getAiProviderDetail(
      params.id,
      KeyVaultsGateKeeper.getUserKeyVaults,
    );

    if (!userCard) return redirect('/settings/provider');

    return <ProviderDetail {...userCard} />;
  }

  return <ClientMode id={params.id} />;
};

export default Page;

export const dynamic = 'auto';
