import ServerLayout from '@/components/server/ServerLayout';
import { serverFeatureFlags } from '@/config/featureFlags';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import SettingsContextProvider from './_layout/ContextProvider';
import Desktop from './_layout/Desktop';
import Mobile from './_layout/Mobile';
import { LayoutProps } from './_layout/type';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('header.title'),
    url: '/settings',
  });
};

const SettingsLayout = ServerLayout<LayoutProps>({ Desktop, Mobile });

const SettingsPage = async (props: DynamicLayoutProps) => {
  const { showOpenAIProxyUrl, showOpenAIApiKey } = serverFeatureFlags();

  return (
    <SettingsContextProvider
      value={{
        showOpenAIApiKey: showOpenAIApiKey,
        showOpenAIProxyUrl: showOpenAIProxyUrl,
      }}
    >
      {/* @ts-ignore */}
      <SettingsLayout {...props} />
    </SettingsContextProvider>
  );
};

export default SettingsPage;
