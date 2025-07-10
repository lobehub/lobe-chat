import { lambdaClient } from '@/libs/trpc/client';

import { IExportService } from './type';

export class ServerService implements IExportService {
  exportData: IExportService['exportData'] = async () => {
    return await lambdaClient.exporter.exportData.mutate();
  };
}
