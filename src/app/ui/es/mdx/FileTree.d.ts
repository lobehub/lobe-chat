import { FC, ReactNode } from 'react';
import { type IconProps } from "../Icon";
export interface _FileTreeProps {
    children: ReactNode;
}
declare const _FileTree: FC<_FileTreeProps>;
export interface FolderProps {
    children: ReactNode;
    defaultOpen?: boolean;
    icon?: IconProps['icon'];
    name: string;
}
declare const Folder: FC<FolderProps>;
export interface FileProps {
    icon?: IconProps['icon'];
    name: string;
}
declare const File: FC<FileProps>;
export type FileTreeProps = typeof _FileTree & {
    File: typeof File;
    Folder: typeof Folder;
};
declare const FileTree: FileTreeProps;
export default FileTree;
