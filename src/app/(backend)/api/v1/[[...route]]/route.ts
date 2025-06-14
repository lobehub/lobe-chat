import { handle } from 'hono/vercel';

import { honoApp } from '../_hono/app';

// 导出所有需要的HTTP方法处理器
export const GET = handle(honoApp);
export const POST = handle(honoApp);
export const PUT = handle(honoApp);
export const DELETE = handle(honoApp);
export const PATCH = handle(honoApp);
export const OPTIONS = handle(honoApp);
export const HEAD = handle(honoApp);
