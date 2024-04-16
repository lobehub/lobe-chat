export var calcSize = function calcSize(size) {
  var fontSize;
  var strokeWidth;
  switch (size) {
    case 'large':
      {
        fontSize = 24;
        strokeWidth = 2;
        break;
      }
    case 'normal':
      {
        fontSize = 20;
        strokeWidth = 2;
        break;
      }
    case 'small':
      {
        fontSize = 14;
        strokeWidth = 1.5;
        break;
      }
    default:
      {
        if (size) {
          fontSize = (size === null || size === void 0 ? void 0 : size.fontSize) || 24;
          strokeWidth = (size === null || size === void 0 ? void 0 : size.strokeWidth) || 2;
        } else {
          fontSize = '1em';
          strokeWidth = 2;
        }
        break;
      }
  }
  return {
    fontSize: fontSize,
    strokeWidth: strokeWidth
  };
};