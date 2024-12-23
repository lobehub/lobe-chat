import { PagePropsWithId } from '@/types/next';

const Page = async (props: PagePropsWithId) => {
  const params = await props.params;

  return <div> {params.id}</div>;
};

export default Page;
