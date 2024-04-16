type colorStep = [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
];
export interface ColorScaleItem {
    dark: colorStep;
    darkA: colorStep;
    light: colorStep;
    lightA: colorStep;
}
export interface ColorScales {
    blue: ColorScaleItem;
    bnw: ColorScaleItem;
    cyan: ColorScaleItem;
    geekblue: ColorScaleItem;
    gold: ColorScaleItem;
    gray: ColorScaleItem;
    green: ColorScaleItem;
    lime: ColorScaleItem;
    magenta: ColorScaleItem;
    orange: ColorScaleItem;
    purple: ColorScaleItem;
    red: ColorScaleItem;
    volcano: ColorScaleItem;
    yellow: ColorScaleItem;
}
export declare const colorScales: ColorScales;
export {};
