'use client';

import React, { Suspense } from 'react';

import Client from './Client';

const AuthHandoffPage = () => (
  <Suspense>
    <Client />
  </Suspense>
);

export default AuthHandoffPage;
