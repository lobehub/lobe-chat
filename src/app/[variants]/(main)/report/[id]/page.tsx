import { Metadata } from 'next';

import { getCanonicalUrl } from '@/server/utils/url';

import ReportPage from './features/ReportPage';

export const metadata: Metadata = {
  alternates: { canonical: getCanonicalUrl('/report') },
  title: 'Serenvale - Report Generation',
};

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Report(props: ReportPageProps) {
  const params = await props.params;
  return <ReportPage patientId={params.id} />;
}
