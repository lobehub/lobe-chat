import { PagePropsWithId } from '@/types/next';

import Client from './Client';

export default async (props: PagePropsWithId) => {
  const params = await props.params;

  return <Client id={params.id} />;
};
