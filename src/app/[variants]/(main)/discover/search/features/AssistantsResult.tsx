import { Locales } from '@/locales/resources';
import { DiscoverService } from '@/server/services/discover';

import Back from '../../(detail)/features/Back';
import List from '../../(list)/assistants/features/List';

const AssistantsResult = async ({
  locale,
  q,
  mobile,
}: {
  locale: Locales;
  mobile?: boolean;
  q: string;
}) => {
  const discoverService = new DiscoverService();
  const items = await discoverService.searchAssistant(locale, q);

  return (
    <>
      {!mobile && <Back href={'/discover/assistants'} style={{ marginBottom: 0 }} />}
      <List items={items} mobile={mobile} searchKeywords={q} />
    </>
  );
};

export default AssistantsResult;
