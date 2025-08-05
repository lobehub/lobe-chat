import { ServerService } from './server';

// Mobile 端只使用 server 模式，通过 tRPC 调用云端 API
export const aiProviderService = new ServerService();
