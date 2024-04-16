import { type CollapseProps } from 'antd';
import { type ReactNode } from 'react';
import { type IconProps } from "../../Icon";
export type FormVariant = 'default' | 'block' | 'ghost' | 'pure';
export type ItemsType = 'group' | 'flat';
export declare const useStyles: (props?: FormVariant | undefined) => import("antd-style").ReturnStyles<{
    flatGroup: string;
    group: string;
    icon: import("antd-style").SerializedStyles;
    mobileFlatGroup: import("antd-style").SerializedStyles;
    mobileGroupBody: import("antd-style").SerializedStyles;
    mobileGroupHeader: import("antd-style").SerializedStyles;
    title: import("antd-style").SerializedStyles;
}>;
export interface FormGroupProps extends CollapseProps {
    children: ReactNode;
    defaultActive?: boolean;
    extra?: ReactNode;
    icon?: IconProps['icon'];
    itemsType?: ItemsType;
    title?: ReactNode;
    variant?: FormVariant;
}
declare const FormGroup: import("react").NamedExoticComponent<FormGroupProps>;
export default FormGroup;
