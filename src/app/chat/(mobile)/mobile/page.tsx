import { Metadata } from 'next';
import urlJoin from 'url-join';

import { OFFICIAL_URL } from '@/const/url';

import Client from './index';

const Page = () => <Client />;

export default Page;

export const metadata: Metadata = {
  alternates: { canonical: urlJoin(OFFICIAL_URL, '/chat/mobile') },
};
