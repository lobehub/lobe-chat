import { camelCase } from 'lodash-es';

export const presetColors = [
  'red',
  'volcano',
  'orange',
  'gold',
  'yellow',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
  'magenta',
  'gray',
];

export const presetSystemColors = new Set(['error', 'warning', 'success', 'info', 'processing']);

export const colorsPreset = (theme: any, type: string, ...keys: string[]) =>
  theme[camelCase([type, ...keys].join('-'))] as string;

export const colorsPresetSystem = (theme: any, type: string, ...keys: string[]) => {
  const t = type === 'processing' ? 'info' : type;
  return theme[camelCase(['color', t, ...keys].join('-'))] as string;
};
