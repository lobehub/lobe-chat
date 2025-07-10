import { ExportDatabaseData } from '@/types/export';

export interface IExportService {
  exportData(): Promise<ExportDatabaseData>;
}
