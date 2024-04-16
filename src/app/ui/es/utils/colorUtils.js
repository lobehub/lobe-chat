import chroma from 'chroma-js';
export var convertAlphaToSolid = function convertAlphaToSolid(foreground, background) {
  var fgColor = chroma(foreground);
  var bgColor = chroma(background);
  var alpha = fgColor.alpha();
  var alphaComplement = 1 - alpha;
  var mixedColor = [fgColor.get('rgb.r') * alpha + bgColor.get('rgb.r') * alphaComplement, fgColor.get('rgb.g') * alpha + bgColor.get('rgb.g') * alphaComplement, fgColor.get('rgb.b') * alpha + bgColor.get('rgb.b') * alphaComplement];
  var resultColor = chroma(mixedColor);
  return resultColor.hex();
};