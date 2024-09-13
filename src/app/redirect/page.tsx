import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export default function Page({ searchParams }: { searchParams: { url: string } }) {
  redirect(searchParams.url);
}

export function generateMetadata(): Metadata {
  return {
    robots: {
      follow: false,
      index: false,
    },
  };
}
