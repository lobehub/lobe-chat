import { ReactNode } from 'react';
import { DivProps } from "../../types";
export declare const useStyles: (props?: unknown) => import("antd-style").ReturnStyles<{
    formTitle: import("antd-style").SerializedStyles;
}>;
export interface FormTitleProps extends DivProps {
    avatar?: ReactNode;
    desc?: ReactNode;
    tag?: string;
    title: string;
}
declare const FormTitle: import("react").NamedExoticComponent<FormTitleProps>;
export default FormTitle;
