import urlJoin from 'url-join';

import iconMap from './icon-map.json';
import type { FileExtensionsKey, FileNamesKey, FolderNamesKey } from './type';

const UNPKG_API = 'https://unpkg.com';
const ALIYUN_API = 'https://registry.npmmirror.com';

export type CDN = 'aliyun' | 'unpkg';

export interface CdnApi {
  path: string;
  pkg: string;
  proxy?: CDN;
  version?: string;
}

/**
 * 生成 CDN URL
 */
export const genCdnUrl = ({ pkg, version = 'latest', path, proxy }: CdnApi): string => {
  switch (proxy) {
    case 'unpkg': {
      return urlJoin(UNPKG_API, `${pkg}@${version}`, path);
    }
    default: {
      return urlJoin(ALIYUN_API, pkg, version, 'files', path);
    }
  }
};

function getFileExtension(fileName: string): string {
  return fileName.slice(Math.max(0, fileName.lastIndexOf('.') + 1));
}

function getFileSuffix(fileName: string): FileExtensionsKey {
  return fileName.slice(fileName.indexOf('.') + 1) as FileExtensionsKey;
}

export function filenameFromPath(path: string): string {
  const segments = path.split('/');
  return segments.at(-1) ?? path;
}

export function getIconNameForFileName(fileName: string) {
  return (
    iconMap.fileNames[fileName as FileNamesKey] ??
    iconMap.fileNames[fileName.toLowerCase() as FileNamesKey] ??
    iconMap.fileExtensions[getFileSuffix(fileName)] ??
    iconMap.fileExtensions[getFileExtension(fileName) as FileExtensionsKey] ??
    (fileName.endsWith('.html') ? 'html' : null) ??
    (fileName.endsWith('.ts') ? 'typescript' : null) ??
    (fileName.endsWith('.js') ? 'javascript' : null) ??
    'file'
  );
}

export function getIconNameForDirectoryName(dirName: string) {
  return (
    iconMap.folderNames[dirName as FolderNamesKey] ??
    iconMap.folderNames[dirName.toLowerCase() as FolderNamesKey] ??
    'folder'
  );
}

export function getIconForFilePath(path: string) {
  const fileName = filenameFromPath(path);
  return getIconNameForFileName(fileName);
}

export function getIconForDirectoryPath(path: string) {
  const dirName = filenameFromPath(path);
  return getIconNameForDirectoryName(dirName);
}

export function getIconUrlByName(iconName: string, iconsUrl: string, open?: boolean): string {
  return `${iconsUrl}/${iconName.toString()}${open ? '-open' : ''}.svg`;
}

export function getIconUrlForFilePath({
  path,
  iconsUrl,
  fallbackUnknownType,
}: {
  fallbackUnknownType: boolean;
  iconsUrl: string;
  path: string;
}): string {
  const iconName = getIconForFilePath(path);
  if (fallbackUnknownType && iconName === 'file') return '';
  return getIconUrlByName(iconName, iconsUrl);
}

export function getIconUrlForDirectoryPath({
  path,
  iconsUrl,
  open,
  fallbackUnknownType,
}: {
  fallbackUnknownType: boolean;
  iconsUrl: string;
  open?: boolean;
  path: string;
}): string {
  const iconName = getIconForDirectoryPath(path);
  if (fallbackUnknownType && iconName === 'folder') return '';
  return getIconUrlByName(iconName, iconsUrl, open);
}
