import { ConfigFile } from '@/types/exportConfig';
import { ImportResults, ImporterEntryData, OnImportCallbacks } from '@/types/importer';
import { UserSettings } from '@/types/user/settings';

export interface IImportService {
  importConfigState(config: ConfigFile, callbacks?: OnImportCallbacks): Promise<void>;
  importData(data: ImporterEntryData, callbacks?: OnImportCallbacks): Promise<void | ImportResults>;
  importSettings(settings: UserSettings): Promise<void>;
}

export interface ImportResult {
  added: number;
  errors: number;
  skips: number;
}
