import { notification } from '@/components/AntdStaticMethods';
import { Migration } from '@/migrations';
import { ConfigFile } from '@/types/exportConfig';

export const importConfigFile = async (
  file: File,
  onConfigImport: (config: ConfigFile) => Promise<void>,
) => {
  const text = await file.text();

  try {
    const config = JSON.parse(text);
    const { state, version } = Migration.migrate(config);

    await onConfigImport({ ...config, state, version });
  } catch (error) {
    console.error(error);
    notification.error({
      description: `出错原因: ${(error as Error).message}`,
      message: '导入失败',
    });
  }
};
