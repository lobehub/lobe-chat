/// <reference types="react" />
import { type InputNumberProps } from 'antd';
import { SliderSingleProps } from 'antd/es/slider';
import { CommonSpaceNumber } from 'react-layout-kit';
export interface SliderWithInputProps extends SliderSingleProps {
    controls?: InputNumberProps['controls'];
    gap?: CommonSpaceNumber | number;
    size?: InputNumberProps['size'];
}
declare const SliderWithInput: import("react").NamedExoticComponent<SliderWithInputProps>;
export default SliderWithInput;
