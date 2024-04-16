/// <reference types="react" />
import { type DivProps } from "../../types";
export interface DraggablePanelHeaderProps extends Omit<DivProps, 'children'> {
    pin?: boolean;
    position?: 'left' | 'right';
    setExpand?: (expand: boolean) => void;
    setPin?: (pin: boolean) => void;
    title?: string;
}
declare const DraggablePanelHeader: import("react").NamedExoticComponent<DraggablePanelHeaderProps>;
export default DraggablePanelHeader;
