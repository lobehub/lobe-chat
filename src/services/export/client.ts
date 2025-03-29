import { clientDB } from '@/database/client/db';
import { DataExporterRepos } from '@/database/repositories/dataExporter';
import { BaseClientService } from '@/services/baseClientService';

export class ClientService extends BaseClientService {
  private get dataExporterRepos(): DataExporterRepos {
    return new DataExporterRepos(clientDB as any, this.userId);
  }

  exportData = async () => {
    const data = await this.dataExporterRepos.export();

    return { data, url: undefined };
  };
}
