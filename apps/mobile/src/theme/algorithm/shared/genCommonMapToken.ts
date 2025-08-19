import type { CommonMapToken, SeedToken } from '../../interface';
import genRadius from './genRadius';

export default function genCommonMapToken(token: SeedToken): CommonMapToken {
  const { motionUnit, motionBase, borderRadius, lineWidth } = token;

  return {
    // line
    lineWidthBold: lineWidth + 1,

    // motion
    motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,

    motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,

    motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,

    // radius
    ...genRadius(borderRadius),
  };
}
