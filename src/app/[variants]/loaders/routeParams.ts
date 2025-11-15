import type { LoaderFunctionArgs } from 'react-router-dom';

/**
 * Generic route params loader
 * Extracts all params from the route and returns them
 * Usage: loader: routeParamsLoader
 * Access in component: const params = useLoaderData<RouteParams>();
 */
export interface RouteParams {
  [key: string]: string | undefined;
}

export const routeParamsLoader = ({ params }: LoaderFunctionArgs): RouteParams => {
  return params;
};

/**
 * Specific loader for routes with 'slug' param
 * Returns: { slug: string }
 */
export interface SlugParams {
  slug: string;
}

export const slugLoader = ({ params }: LoaderFunctionArgs): SlugParams => {
  if (!params.slug) {
    throw new Error('Slug parameter is required');
  }
  return { slug: params.slug };
};

/**
 * Specific loader for routes with 'id' param
 * Returns: { id: string }
 */
export interface IdParams {
  id: string;
}

export const idLoader = ({ params }: LoaderFunctionArgs): IdParams => {
  if (!params.id) {
    throw new Error('ID parameter is required');
  }
  return { id: params.id };
};
