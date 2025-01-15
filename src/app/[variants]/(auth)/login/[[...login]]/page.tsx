import { SignIn } from '@clerk/nextjs';
import { notFound } from 'next/navigation';

import { enableClerk } from '@/const/auth';
import { BRANDING_NAME } from '@/const/branding';
import { metadataModule } from '@/server/metadata';
import { translation } from '@/server/translation';

export const generateMetadata = async () => {
  const { t } = await translation('clerk');
  return metadataModule.generate({
    description: t('signIn.start.subtitle'),
    title: t('signIn.start.title', { applicationName: BRANDING_NAME }),
    url: '/login',
  });
};

const Page = () => {
  if (!enableClerk) return notFound();

  return <SignIn path="/login" />;
};

Page.displayName = 'Login';

export default Page;
