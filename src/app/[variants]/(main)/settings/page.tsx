import ServerLayout from '@/components/server/ServerLayout';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

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
  return (
    // @ts-ignore
    <SettingsLayout {...props} />
  );
};

export default SettingsPage;
