import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import Client from './Client';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('common', locale);

  return metadataModule.generate({
    description: 'Use Claude Code SDK to build AI-powered coding assistants',
    title: 'Claude Code',
    url: '/claude-code',
  });
};

const Page = async () => {
  return <Client />;
};

export default Page;
