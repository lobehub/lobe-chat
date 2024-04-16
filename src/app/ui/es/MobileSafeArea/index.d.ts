import React from 'react';
import { DivProps } from "../types";
export interface MobileSafeAreaProps extends DivProps {
    position: 'top' | 'bottom';
}
declare const MobileSafeArea: React.NamedExoticComponent<MobileSafeAreaProps>;
export default MobileSafeArea;
