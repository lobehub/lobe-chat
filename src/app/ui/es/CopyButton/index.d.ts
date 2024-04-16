/// <reference types="react" />
import { type ActionIconProps } from "../ActionIcon";
export interface CopyButtonProps extends ActionIconProps {
    /**
     * @description The text content to be copied
     */
    content: string;
}
declare const CopyButton: import("react").NamedExoticComponent<CopyButtonProps>;
export default CopyButton;
