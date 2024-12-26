import { redirect } from 'next/navigation';

import { PagePropsWithId } from '@/types/next';

export default async (props: PagePropsWithId) => {
  const params = await props.params;

  return redirect(`/repos/${params.id}/evals/dataset`);
};
