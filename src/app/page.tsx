import StructuredData from '@/components/StructuredData';
import { translation } from '@/server/translation';
import { ldServices } from '@/services/ld';

import Client from './(loading)/Client';
import Redirect from './(loading)/Redirect';

const Page = async () => {
  const { t } = await translation('metadata');
  const ld = ldServices.generate({
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
