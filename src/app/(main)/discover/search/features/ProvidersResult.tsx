import { Locales } from '@/locales/resources';
import { DiscoverService } from '@/server/services/discover';

import List from '../../(list)/providers/features/List';

const ProvidersResult = async ({
  locale,
  q,
  mobile,
}: {
  locale: Locales;
  mobile?: boolean;
  q: string;
}) => {
  const discoverService = new DiscoverService();
  const items = await discoverService.searchProvider(locale, q);

  return <List items={items} mobile={mobile} searchKeywords={q} />;
};

export default ProvidersResult;
