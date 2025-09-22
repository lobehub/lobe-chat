import ServerLayout from '@/components/server/ServerLayout';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

import { serverFeatureFlags } from '@/config/featureFlags';
import SettingsContextProvider from './_layout/ContextProvider';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/settings',
  });
};

const SettingsLayout = ServerLayout<LayoutProps & {
  showLLM?: boolean
}>({ Desktop, Mobile });

const SettingsPage = async (props: DynamicLayoutProps) => {
  const showLLM = serverFeatureFlags().showProvider;
  const { showOpenAIProxyUrl, showOpenAIApiKey } = serverFeatureFlags();

  return (
    <SettingsContextProvider value={{
      showOpenAIApiKey: showOpenAIApiKey,
      showOpenAIProxyUrl: showOpenAIProxyUrl
    }}>
      <SettingsLayout {...props} showLLM={showLLM} />
    </SettingsContextProvider>
  );
};

export default SettingsPage;
