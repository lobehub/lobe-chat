import type { ColorScaleItem } from '../types';
import blue from './blue';
import cyan from './cyan';
import geekblue from './geekblue';
import gold from './gold';
import gray from './gray';
import green from './green';
import lime from './lime';
import magenta from './magenta';
import orange from './orange';
import primary from './primary';
import purple from './purple';
import red from './red';
import volcano from './volcano';
import yellow from './yellow';

export interface ColorScales {
  blue: ColorScaleItem;
  cyan: ColorScaleItem;
  geekblue: ColorScaleItem;
  gold: ColorScaleItem;
  gray: ColorScaleItem;
  green: ColorScaleItem;
  lime: ColorScaleItem;
  magenta: ColorScaleItem;
  orange: ColorScaleItem;
  primary: ColorScaleItem;
  purple: ColorScaleItem;
  red: ColorScaleItem;
  volcano: ColorScaleItem;
  yellow: ColorScaleItem;
}

export const colorScales: ColorScales = {
  blue,
  cyan,
  geekblue,
  gold,
  gray,
  green,
  lime,
  magenta,
  orange,
  primary,
  purple,
  red,
  volcano,
  yellow,
};

export { colorScales as colors };

export { default as blue } from './blue';
export { default as cyan } from './cyan';
export { default as geekblue } from './geekblue';
export { default as gold } from './gold';
export { default as gray } from './gray';
export { default as green } from './green';
export { default as lime } from './lime';
export { default as magenta } from './magenta';
export { default as orange } from './orange';
export { default as primary } from './primary';
export { default as purple } from './purple';
export { default as red } from './red';
export { default as volcano } from './volcano';
export { default as yellow } from './yellow';
