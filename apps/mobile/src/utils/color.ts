import { ColorInput, FastColor, HSV } from '@ant-design/fast-color';

export const getRoundNumber = (value: number) => Math.round(Number(value || 0));

const convertHsb2Hsv = (color: ColorGenInput): ColorInput => {
  if (color instanceof FastColor) {
    return color;
  }

  if (color && typeof color === 'object' && 'h' in color && 'b' in color) {
    const { b, ...resets } = color as HSB;
    return {
      ...resets,
      v: b,
    } as HSV;
  }
  if (typeof color === 'string' && /hsb/.test(color)) {
    return color.replace(/hsb/, 'hsv');
  }
  return color as ColorInput;
};

export class Color extends FastColor {
  constructor(color: ColorGenInput) {
    super(convertHsb2Hsv(color));
  }

  toHsbString() {
    const hsb = this.toHsb();
    const saturation = getRoundNumber(hsb.s * 100);
    const lightness = getRoundNumber(hsb.b * 100);
    const hue = getRoundNumber(hsb.h);
    const alpha = hsb.a;
    const hsbString = `hsb(${hue}, ${saturation}%, ${lightness}%)`;
    const hsbaString = `hsba(${hue}, ${saturation}%, ${lightness}%, ${alpha.toFixed(
      alpha === 0 ? 0 : 2,
    )})`;
    return alpha === 1 ? hsbString : hsbaString;
  }

  toHsb() {
    const { v, ...resets } = this.toHsv();
    return {
      ...resets,
      a: this.a,
      b: v,
    };
  }
}

export const toHexFormat = (value?: string, alpha?: boolean) =>
  value?.replace(/[^\w/]/g, '').slice(0, alpha ? 8 : 6) || '';

export const getHex = (value?: string, alpha?: boolean) => (value ? toHexFormat(value, alpha) : '');

export type Colors<T> = {
  color: ColorGenInput<T>;
  percent: number;
}[];

export interface HSB {
  b: number | string;
  h: number | string;
  s: number | string;
}
export interface RGB {
  b: number | string;
  g: number | string;
  r: number | string;
}

export type ColorGenInput<T = Color> = string | number | RGB | RGBA | HSB | HSBA | T;

export interface HSBA extends HSB {
  a: number;
}
export interface RGBA extends RGB {
  a: number;
}

export type GradientColor = {
  color: AggregationColor;
  percent: number;
}[];

export class AggregationColor {
  /** Original Color object */
  private metaColor: Color;

  private colors: GradientColor | undefined;

  public cleared = false;

  constructor(color: ColorGenInput<AggregationColor> | Colors<AggregationColor>) {
    // Clone from another AggregationColor
    if (color instanceof AggregationColor) {
      this.metaColor = color.metaColor.clone();
      this.colors = color.colors?.map((info) => ({
        color: new AggregationColor(info.color),
        percent: info.percent,
      }));
      this.cleared = color.cleared;
      return;
    }

    const isArray = Array.isArray(color);

    if (isArray && color.length) {
      this.colors = color.map(({ color: c, percent }) => ({
        color: new AggregationColor(c),
        percent,
      }));
      this.metaColor = new Color(this.colors[0].color.metaColor);
    } else {
      this.metaColor = new Color(isArray ? '' : color);
    }

    if (!color || (isArray && !this.colors)) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }

  toHsb() {
    return this.metaColor.toHsb();
  }

  toHsbString() {
    return this.metaColor.toHsbString();
  }

  toHex() {
    return getHex(this.toHexString(), this.metaColor.a < 1);
  }

  toHexString() {
    return this.metaColor.toHexString();
  }

  toRgb() {
    return this.metaColor.toRgb();
  }

  toRgbString() {
    return this.metaColor.toRgbString();
  }

  isGradient(): boolean {
    return !!this.colors && !this.cleared;
  }

  getColors(): GradientColor {
    return this.colors || [{ color: this, percent: 0 }];
  }

  toCssString(): string {
    const { colors } = this;

    // CSS line-gradient
    if (colors) {
      const colorsStr = colors.map((c) => `${c.color.toRgbString()} ${c.percent}%`).join(', ');
      return `linear-gradient(90deg, ${colorsStr})`;
    }

    return this.metaColor.toRgbString();
  }

  equals(color: AggregationColor | null): boolean {
    if (!color || this.isGradient() !== color.isGradient()) {
      return false;
    }

    if (!this.isGradient()) {
      return this.toHexString() === color.toHexString();
    }

    return (
      this.colors!.length === color.colors!.length &&
      this.colors!.every((c, i) => {
        const target = color.colors![i];
        return c.percent === target.percent && c.color.equals(target.color);
      })
    );
  }
}

export const isBright = (value: AggregationColor, bgColorToken: string) => {
  const { r, g, b, a } = value.toRgb();
  const hsv = new Color(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    // Adapted to dark mode
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
