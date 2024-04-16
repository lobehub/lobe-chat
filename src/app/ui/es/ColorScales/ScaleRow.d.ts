/// <reference types="react" />
export interface IScaleRow {
    name: string;
    scale: string[];
    title: 'light' | 'lightA' | 'dark' | 'darkA';
}
declare const ScaleRow: import("react").NamedExoticComponent<IScaleRow>;
export default ScaleRow;
