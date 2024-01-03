import { BuiltinRender } from '@/types/tool';

import { DalleManifest } from './dalle';
import DalleRender from './dalle/Render';

export const BuiltinToolsRenders: Record<string, BuiltinRender> = {
  [DalleManifest.identifier]: DalleRender as BuiltinRender,
  /**
   * 兼容旧版本 dalle3 的 identifier
   * TODO: 后续数据库版本迁移时记得迁移 dalle3 对应的 identifier
   * @deprecated
   */
  dalle3: DalleRender as BuiltinRender,
};
