import { redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async (props: Props) => {
  const params = await props.params;

  return redirect(`/repos/${params.id}/evals/dataset`);
};
