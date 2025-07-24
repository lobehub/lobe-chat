import { isDesktop } from '@/const/version';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Conversation from './features/Conversation';
import Desktop from './features/Desktop';
import Essential from './features/Essential';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('setting', locale);
  return metadataModule.generate({
    description: t('header.desc'),
    title: t('tab.hotkey'),
    url: '/settings/hotkey',
  });
};

const Page = () => {
  return (
    <>
      {isDesktop && <Desktop />}
      <Essential />
      <Conversation />
    </>
  );
};

Page.displayName = 'HotkeySetting';

export default Page;
