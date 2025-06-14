import { Hono } from 'hono';

import { ExampleController } from '../controllers';

// 创建示例路由实例
const ExampleRoutes = new Hono();

// GET /api/v1/example - 获取示例数据
ExampleRoutes.get('/', (c) => {
  const controller = new ExampleController();

  return controller.handleGetExample(c);
});

export default ExampleRoutes;
