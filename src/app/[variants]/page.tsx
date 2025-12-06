import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import MobileRouter from './(mobile)/router';
import DesktopRouter from './router';

export default async (props: DynamicLayoutProps) => {
  // Get isMobile from variants parameter on server side
  const isMobile = await RouteVariants.getIsMobile(props);

  // Conditionally load and render based on device type
  // Using native dynamic import ensures complete code splitting
  // Mobile and Desktop bundles will be completely separate

  if (isMobile) {
    return <MobileRouter />;
  }

  console.log(isMobile, 11_111);

  return <DesktopRouter />;
};
