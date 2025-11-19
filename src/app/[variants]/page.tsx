import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

import DesktopClientRouter from './DesktopClientRouter';
import MobileClientRouter from './MobileClientRouter';

export default async (props: DynamicLayoutProps) => {
  // Get isMobile from variants parameter on server side
  const isMobile = await RouteVariants.getIsMobile(props);
  const { locale } = await RouteVariants.getVariantsFromProps(props);

  // Pass device type and locale to client-side RouterSelector
  // This ensures the server component only does data fetching,
  // and the actual router rendering happens entirely on the client

  if (isMobile) {
    return <MobileClientRouter locale={locale} />;
  }

  return <DesktopClientRouter locale={locale} />;
};
