import { type TagProps as AntTagProps } from 'antd';
import { ReactNode } from 'react';
export interface TagProps extends AntTagProps {
    icon?: ReactNode;
    size?: 'default' | 'small';
}
declare const Tag: import("react").NamedExoticComponent<TagProps>;
export default Tag;
