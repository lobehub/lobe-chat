import { usePathname } from 'next/navigation';

/**
 * Returns true if the current path has a sub slug (`/chat/mobile` or `/chat/settings`)
 */
export const useIsSubSlug = () => {
  const pathname = usePathname();

  const slugs = pathname.split('/').filter(Boolean);

  return slugs.length > 1;
};
