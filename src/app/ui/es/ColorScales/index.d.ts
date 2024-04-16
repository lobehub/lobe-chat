/// <reference types="react" />
import { ColorScaleItem } from "../styles/colors/colors";
export interface ColorScalesProps {
    /**
     * @description Index of the mid highlight color in the scale
     */
    midHighLight: number;
    /**
     * @description Name of the color scale
     */
    name: string;
    /**
     * @description Color scale item object
     */
    scale: ColorScaleItem;
}
declare const ColorScales: import("react").NamedExoticComponent<ColorScalesProps>;
export default ColorScales;
