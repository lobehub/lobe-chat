'use client';

import { BrowserRouter, Routes } from 'react-router-dom';

import { renderRoutes } from '@/utils/router';

import { desktopRoutes } from './desktopRouter.config';

const ClientRouter = () => {
  return (
    <BrowserRouter>
      <Routes>{renderRoutes(desktopRoutes)}</Routes>
    </BrowserRouter>
  );
};

ClientRouter.displayName = 'ClientRouter';

export default ClientRouter;
