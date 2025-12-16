import { Metadata } from 'next';

import { BRANDING_NAME } from '@/const/branding';
import { translation } from '@/server/translation';
import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

export const generateMetadata = async (props: DynamicLayoutProps): Promise<Metadata> => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('onboarding', locale);

  return {
    title: t('title', { appName: BRANDING_NAME }),
  };
};
