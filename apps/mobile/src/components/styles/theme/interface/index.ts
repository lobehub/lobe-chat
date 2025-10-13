import type { MapToken } from './maps';
import type { SeedToken } from './seeds';

export type TokenType = object;
export type DerivativeFunc<DesignToken extends TokenType, DerivativeToken extends TokenType> = (
  designToken: DesignToken,
  derivativeToken?: DerivativeToken,
) => DerivativeToken;

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;

export type { AliasToken } from './alias';
export type {
  ColorMapToken,
  ColorNeutralMapToken,
  CommonMapToken,
  FontMapToken,
  HeightMapToken,
  MapToken,
  SizeMapToken,
  StyleMapToken,
} from './maps';
export type { PresetColorKey, PresetColorType } from './presetColors';
export type { SeedToken } from './seeds';
