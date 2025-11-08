import { DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

export default async function Page(props: DynamicLayoutProps) {
  // Get isMobile from variants parameter on server side
  const isMobile = await RouteVariants.getIsMobile(props);

  // Conditionally load and render based on device type
  // Using native dynamic import ensures complete code splitting
  // Mobile and Desktop bundles will be completely separate
  if (isMobile) {
    const { default: MobileRouter } = await import('./MobileRouter');
    return <MobileRouter />;
  }

  const { default: DesktopRouter } = await import('./DesktopRouter');
  return <DesktopRouter />;
}
