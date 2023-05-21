import type { NextPage } from 'next';
import Head from 'next/head';
import { memo } from 'react';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>lobehub</title>
      </Head>
      lobehub
    </>
  );
};

export default memo(Home);
