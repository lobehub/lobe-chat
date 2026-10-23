// The route tables sit in the entry chunk's static graph; resolving the real
// loader on first use keeps the home store out of that graph.
export const homeTopicRecentsLoader = () =>
  import('@/routes/(main)/home/homeTopicRecentsLoader').then((module) =>
    module.homeTopicRecentsLoader(),
  );
