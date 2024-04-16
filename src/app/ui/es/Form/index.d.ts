import { FormProps as AntFormProps, type FormInstance } from 'antd';
import { type ReactNode, RefAttributes } from 'react';
import FormGroup, { type FormGroupProps, FormVariant, ItemsType } from './components/FormGroup';
import FormItem, { type FormItemProps } from './components/FormItem';
export interface ItemGroup {
    children: FormItemProps[] | ReactNode;
    defaultActive?: boolean;
    extra?: FormGroupProps['extra'];
    icon?: FormGroupProps['icon'];
    title: FormGroupProps['title'];
}
export interface FormProps extends Omit<AntFormProps, 'variant'> {
    children?: ReactNode;
    footer?: ReactNode;
    itemMinWidth?: FormItemProps['minWidth'];
    items?: ItemGroup[] | FormItemProps[];
    itemsType?: ItemsType;
    variant?: FormVariant;
}
export interface IForm {
    (props: FormProps & RefAttributes<FormInstance>): ReactNode;
    Group: typeof FormGroup;
    Item: typeof FormItem;
}
declare const Form: IForm;
export default Form;
