import lobeOpenApi from '@lobechat/openapi';
import { handle } from 'hono/vercel';

// 导出所有需要的HTTP方法处理器
export const GET = handle(lobeOpenApi);
export const POST = handle(lobeOpenApi);
export const PUT = handle(lobeOpenApi);
export const DELETE = handle(lobeOpenApi);
export const PATCH = handle(lobeOpenApi);
export const OPTIONS = handle(lobeOpenApi);
export const HEAD = handle(lobeOpenApi);
