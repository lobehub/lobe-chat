import type { SeedToken, SizeMapToken } from '../../interface';

export default function genSizeMapToken(token: SeedToken): SizeMapToken {
  const { sizeUnit, sizeStep } = token;

  return {
    // 16
    size: sizeUnit * sizeStep,

    // 32
    sizeLG: sizeUnit * (sizeStep + 2),

    // 24
    sizeMD: sizeUnit * (sizeStep + 1),

    // 20
    sizeMS: sizeUnit * sizeStep,

    // 16
    sizeSM: sizeUnit * (sizeStep - 1),

    // 48
    sizeXL: sizeUnit * (sizeStep + 4),
    // 12
    sizeXS: sizeUnit * (sizeStep - 2),
    sizeXXL: sizeUnit * (sizeStep + 8), // 8
    sizeXXS: sizeUnit * (sizeStep - 3), // 4
  };
}
