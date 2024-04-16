/// <reference types="react" />
import { FormItemProps as AntdFormItemProps } from 'antd';
import { type FormTitleProps } from './FormTitle';
export declare const useStyles: (props?: string | number | undefined) => import("antd-style").ReturnStyles<{
    item: import("antd-style").SerializedStyles;
    itemNoDivider: import("antd-style").SerializedStyles;
}>;
export interface FormItemProps extends AntdFormItemProps {
    avatar?: FormTitleProps['avatar'];
    desc?: FormTitleProps['desc'];
    divider?: boolean;
    hidden?: boolean;
    minWidth?: string | number;
    tag?: FormTitleProps['tag'];
}
declare const FormItem: import("react").NamedExoticComponent<FormItemProps>;
export default FormItem;
