import type { NumberSize, Size } from 're-resizable';
import { type CSSProperties } from 'react';
import type { Props as RndProps } from 'react-rnd';
import { DivProps } from "../types";
export type placementType = 'right' | 'left' | 'top' | 'bottom';
export interface DraggablePanelProps extends DivProps {
    /**
     * @title The class name for the content and handle component
     */
    classNames?: {
        content?: string;
        handle?: string;
    };
    /**
     * @description The default expand state of the panel
     * @default true
     */
    defaultExpand?: boolean;
    /**
     * @description The default size of the panel
     */
    defaultSize?: Partial<Size>;
    /**
     * @description Whether the panel should be destroyed when closed or not
     * @default false
     */
    destroyOnClose?: boolean;
    /**
     * @description Whether the panel is expanded or not
     */
    expand?: boolean;
    /**
     * @description Whether the panel is expandable or not
     * @default true
     */
    expandable?: boolean;
    fullscreen?: boolean;
    /**
     * @description The style of the panel handler
     * @type CSSProperties
     */
    hanlderStyle?: CSSProperties;
    headerHeight?: number;
    maxHeight?: number;
    maxWidth?: number;
    /**
     * @description The minimum height of the panel
     */
    minHeight?: number;
    /**
     * @description The minimum width of the panel
     */
    minWidth?: number;
    /**
     * @description The mode of the panel, fixed or float
     * @default 'fixed'
     */
    mode?: 'fixed' | 'float';
    /**
     * @description Callback function when the expand state of the panel changes
     */
    onExpandChange?: (expand: boolean) => void;
    /**
     * @description Callback function when the size of the panel changes
     */
    onSizeChange?: (delta: NumberSize, size?: Size) => void;
    /**
     * @description Callback function when the panel is being resized
     */
    onSizeDragging?: (delta: NumberSize, size?: Size) => void;
    /**
     * @description Whether the panel can be pinned or not
     * @default true
     */
    pin?: boolean;
    /**
     * @description The placement of the panel, right, left, top or bottom
     * @default 'right'
     */
    placement: placementType;
    /**
     * @description Whether the panel can be resized or not
     * @default true
     */
    resize?: RndProps['enableResizing'];
    showHandlerWhenUnexpand?: boolean;
    /**
     * @description Whether the panel handler should be shown when unexpanded or not
     * @default true
     */
    showHandlerWideArea?: boolean;
    /**
     * @description The size of the panel
     */
    size?: Partial<Size>;
}
declare const DraggablePanel: import("react").NamedExoticComponent<DraggablePanelProps>;
export default DraggablePanel;
