import { clientDB } from '@/database/client/db';
import { TableViewerRepo } from '@/database/repositories/tableViewer';
import { BaseClientService } from '@/services/baseClientService';

export class ClientService extends BaseClientService {
  private get tableViewerRepo(): TableViewerRepo {
    return new TableViewerRepo(clientDB as any, this.userId);
  }

  getAllTables = async () => this.tableViewerRepo.getAllTables();

  getTableDetails = async (tableName: string) => this.tableViewerRepo.getTableDetails(tableName);

  getTableData = async (tableName: string) =>
    this.tableViewerRepo.getTableData(tableName, { page: 1, pageSize: 300 });
}
