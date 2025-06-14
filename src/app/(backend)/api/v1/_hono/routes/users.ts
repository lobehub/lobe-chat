import { Hono } from 'hono';

import { UserController } from '../controllers';

const UserRoutes = new Hono();

UserRoutes.get('/current', async (c) => {
  console.log('获取当前用户信息');

  const userController = new UserController();

  return await userController.getCurrentUser(c);
});

export default UserRoutes;
