import { redirect } from 'next/navigation';

interface Params {
  id: string;
}

type Props = { params: Params };

export default ({ params }: Props) => redirect(`/repos/${params.id}/evals/dataset`);
