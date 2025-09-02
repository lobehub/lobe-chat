import { BRANDING_NAME, isDeprecatedEdition, isServerMode } from '@lobechat/const';
import { downloadFile, exportJSONFile } from '@lobechat/utils/client';
import dayjs from 'dayjs';

import { CURRENT_CONFIG_VERSION } from '@/migrations';
import { ImportPgDataStructure } from '@/types/export';

import { exportService } from './export';
import { configService as deprecatedExportService } from './export/_deprecated';

class ConfigService {
  exportAll = async () => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const config = await deprecatedExportService.exportAll();
      const filename = `${BRANDING_NAME}-config-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(config, filename);
      return;
    }

    const { data, url } = await exportService.exportData();
    const filename = `${dayjs().format('YYYY-MM-DD-hh-mm')}_${BRANDING_NAME}-data.json`;

    // if url exists, means export data from server and upload the data to S3
    // just need to download the file
    if (url) {
      await downloadFile(url, filename);
      return;
    }

    // or export to file with the data
    const result = await this.createDataStructure(data, isServerMode ? 'postgres' : 'pglite');

    exportJSONFile(result, filename);
  };

  exportAgents = async () => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const config = await deprecatedExportService.exportAgents();
      const filename = `${BRANDING_NAME}-agents-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(config, filename);
      return;
    }
  };

  exportSingleAgent = async (agentId: string) => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const result = await deprecatedExportService.exportSingleAgent(agentId);
      if (!result) return;

      const filename = `${BRANDING_NAME}-${result.title}-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(result.config, filename);
      return;
    }
  };

  exportSessions = async () => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const config = await deprecatedExportService.exportSessions();
      const filename = `${BRANDING_NAME}-sessions-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(config, filename);
      return;
    }
  };

  exportSettings = async () => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const config = await deprecatedExportService.exportSessions();
      const filename = `${BRANDING_NAME}-settings-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(config, filename);
      return;
    }
  };

  exportSingleSession = async (sessionId: string) => {
    // TODO: remove this in V2
    if (isDeprecatedEdition) {
      const data = await deprecatedExportService.exportSingleSession(sessionId);
      if (!data) return;

      const filename = `${BRANDING_NAME}-${data.title}-v${CURRENT_CONFIG_VERSION}.json`;
      exportJSONFile(data.config, filename);
      return;
    }
  };

  private createDataStructure = async (
    data: any,
    mode: 'pglite' | 'postgres',
  ): Promise<ImportPgDataStructure> => {
    const { default: json } = await import('@/database/core/migrations.json');
    const latestHash = json.at(-1)?.hash;
    if (!latestHash) {
      throw new Error('Not find database sql hash');
    }

    return { data, mode, schemaHash: latestHash };
  };
}

export const configService = new ConfigService();
