import { ServerService } from './server';

// Mobile端只使用server模式，通过tRPC调用云端API
export const messageService = new ServerService();
