import { ServerService } from './server';

// Mobile 端只使用 server 模式，通过 tRPC 调用云端 API
export const sessionService = new ServerService();

// 默认导出，保持与web端一致的导入方式
export default sessionService;
