import StructuredData from '@/components/StructuredData';
import { ldModule } from '@/server/ld';
import { translation } from '@/server/translation';

import Client from './(loading)/Client';
import Redirect from './(loading)/Redirect';

const Page = async () => {
  const { t } = await translation('metadata');
  const ld = ldModule.generate({
    description: t('chat.description'),
    title: t('chat.title'),
    url: '/',
  });
  return (
    <>
      <StructuredData ld={ld} />
      <Client />
      <Redirect />
    </>
  );
};

Page.displayName = 'Loading';

export default Page;
