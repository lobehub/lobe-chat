import { useLocation } from 'react-router-dom';

/**
 * Hook to get current pathname
 * React Router version for (main) directory
 */
export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
};
