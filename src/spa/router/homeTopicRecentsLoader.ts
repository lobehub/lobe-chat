import type { LoaderFunctionArgs } from 'react-router';

// The route tables sit in the entry chunk's static graph; resolving the real
// loader on first use keeps the home store out of that graph.
export const homeTopicRecentsLoader = (args: LoaderFunctionArgs) =>
  import('@/routes/(main)/home/homeTopicRecentsLoader').then((module) =>
    module.homeTopicRecentsLoader(args),
  );
