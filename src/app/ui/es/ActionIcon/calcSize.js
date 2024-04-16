export var calcSize = function calcSize(size) {
  var blockSize;
  var borderRadius;
  switch (size) {
    case 'large':
      {
        blockSize = 44;
        borderRadius = 8;
        break;
      }
    case 'normal':
      {
        blockSize = 36;
        borderRadius = 5;
        break;
      }
    case 'small':
      {
        blockSize = 24;
        borderRadius = 5;
        break;
      }
    case 'site':
      {
        blockSize = 34;
        borderRadius = 5;
        break;
      }
    default:
      {
        blockSize = (size === null || size === void 0 ? void 0 : size.blockSize) || 36;
        borderRadius = (size === null || size === void 0 ? void 0 : size.borderRadius) || 5;
        break;
      }
  }
  return {
    blockSize: blockSize,
    borderRadius: borderRadius
  };
};