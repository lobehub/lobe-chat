/// <reference types="react" />
import { type ButtonProps } from 'antd';
export interface GradientButtonProps extends ButtonProps {
    glow?: boolean;
}
declare const GradientButton: import("react").NamedExoticComponent<GradientButtonProps>;
export default GradientButton;
