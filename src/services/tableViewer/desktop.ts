import { desktopClient } from '@/libs/trpc/client/desktop';

export class DesktopService {
  getAllTables = async () => {
    return desktopClient.pgTable.getAllTables.query();
  };

  getTableDetails = async (tableName: string) => {
    return desktopClient.pgTable.getTableDetails.query({ tableName });
  };

  getTableData = async (tableName: string) => {
    return desktopClient.pgTable.getTableData.query({ page: 1, pageSize: 300, tableName });
  };
}
