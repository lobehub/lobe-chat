import { Waitlist } from '@clerk/nextjs';
import { notFound } from 'next/navigation';

import { enableClerk } from '@/const/auth';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('clerk', locale);
  return metadataModule.generate({
    description: t('signUp.waitlist.subtitle'),
    title: t('signUp.waitlist.title'),
    url: '/waitlist',
  });
};

const Page = () => {
  if (!enableClerk) return notFound();

  return <Waitlist />;
};

Page.displayName = 'Waitlist';

export default Page;
