/// <reference types="react" />
export interface SwatchesProps {
    /**
     * @description The currently active color
     * @default undefined
     */
    activeColor?: string;
    /**
     * @description An array of colors to be displayed as swatches
     */
    colors: string[];
    /**
     * @description A function to be called when a swatch is selected
     * @default undefined
     */
    onSelect?: (c?: string | undefined) => void;
    /**
     * @description The size of swatch
     * @default 24
     */
    size?: number;
}
declare const Swatches: import("react").NamedExoticComponent<SwatchesProps>;
export default Swatches;
