import { BaseClientService } from '@/services/baseClientService';

import { IUsageService } from './type';
import { RequestLog } from '@/types/usage';

export class ClientService extends BaseClientService implements IUsageService {
    async createRequestLog(requestLog: RequestLog): Promise<void> {

    }
}
