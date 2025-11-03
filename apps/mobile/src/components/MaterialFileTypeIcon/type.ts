import type { ViewProps } from 'react-native';

import iconMap from './icon-map.json';

export type FileNamesKey = keyof (typeof iconMap)['fileNames'];
export type FolderNamesKey = keyof (typeof iconMap)['folderNames'];
export type FileExtensionsKey = keyof (typeof iconMap)['fileExtensions'];

export interface MaterialFileTypeIconProps extends ViewProps {
  /**
   * 是否对未知文件类型使用回退图标
   * @default true
   */
  fallbackUnknownType?: boolean;
  /**
   * 文件或文件夹的名称
   */
  filename: string;
  /**
   * 文件夹是否展开（仅对文件夹类型有效）
   */
  open?: boolean;
  /**
   * 图标尺寸（像素）
   * @default 48
   */
  size?: number;
  /**
   * 图标类型
   */
  type?: 'file' | 'folder';
}
