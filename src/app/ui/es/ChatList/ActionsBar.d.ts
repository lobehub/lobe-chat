/// <reference types="react" />
import { type ActionIconGroupProps } from "../ActionIconGroup";
export interface ActionsBarProps extends ActionIconGroupProps {
    text?: {
        copy?: string;
        delete?: string;
        edit?: string;
        regenerate?: string;
    };
}
declare const ActionsBar: import("react").NamedExoticComponent<ActionsBarProps>;
export default ActionsBar;
