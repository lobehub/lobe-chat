import { useNavigate } from 'react-router-dom';

/**
 * Hook to get router navigation functions
 * React Router version for (main) directory
 *
 * Provides a Next.js-like API using React Router
 */
export const useRouter = () => {
  const navigate = useNavigate();

  return {
    back: () => navigate(-1),
    forward: () => navigate(1),
    // Note: prefetch is not supported in React Router
    prefetch: () => {},

    push: (href: string) => navigate(href),

    replace: (href: string) => navigate(href, { replace: true }),
  };
};
