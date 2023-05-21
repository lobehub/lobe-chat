import type { NextPage } from 'next';
import Head from 'next/head';
import { memo } from 'react';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>lobechat</title>
      </Head>
      lobechat
    </>
  );
};

export default memo(Home);
