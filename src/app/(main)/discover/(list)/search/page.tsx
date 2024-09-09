import { redirect } from 'next/navigation';

import { SearchParams } from '../type';

type Props = { searchParams: SearchParams };

const Page = async ({ searchParams }: Props) => {
  const { q } = searchParams;

  if (q) return redirect(`/discover/search/assistants?q=${q}`);

  return redirect(`/discover/assistants`);
};

Page.DisplayName = 'DiscoverSearch';

export default Page;
