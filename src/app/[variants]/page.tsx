import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import DesktopRouter from './DesktopRouter';
import MobileRouter from './MobileRouter';

export default async (props: DynamicLayoutProps) => {
  // Get isMobile from variants parameter on server side
  const isMobile = await RouteVariants.getIsMobile(props);
  const { locale } = await RouteVariants.getVariantsFromProps(props);

  // Conditionally load and render based on device type
  // Using native dynamic import ensures complete code splitting
  // Mobile and Desktop bundles will be completely separate

  if (isMobile) {
    return <MobileRouter locale={locale} />;
  }

  return <DesktopRouter locale={locale} />;
};
