import { RefObject } from 'react';
import { ColorLayer } from './vendor/gaussianBackground';
export declare const useGaussianBackground: (ref: RefObject<HTMLCanvasElement>) => (layers: ColorLayer[], options?: {
    blurRadius?: number;
    fpsCap?: number;
    scale?: number;
}) => void;
