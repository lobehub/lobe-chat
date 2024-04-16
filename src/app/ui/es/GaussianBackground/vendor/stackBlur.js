import _createClass from "@babel/runtime/helpers/esm/createClass";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { mulTable, shgTable } from "./stackBlurTable";
var BlurStack = /*#__PURE__*/_createClass(function BlurStack() {
  _classCallCheck(this, BlurStack);
  _defineProperty(this, "r", 0);
  _defineProperty(this, "g", 0);
  _defineProperty(this, "b", 0);
  _defineProperty(this, "a", 0);
  _defineProperty(this, "next", void 0);
});
var stackBlurGetElement = function stackBlurGetElement(elementOrID) {
  if (typeof elementOrID === 'string') {
    // eslint-disable-next-line unicorn/prefer-query-selector
    return document.getElementById(elementOrID);
  } else if (elementOrID.nodeType === 1) {
    return elementOrID;
  }
};
export var stackBlurCanvasRGB = function stackBlurCanvasRGB(canvasIDOrElement, topX, topY, width, height, radius) {
  if (Number.isNaN(radius) || radius < 1) return;
  // eslint-disable-next-line no-param-reassign
  radius = Math.trunc(radius);
  var canvas = stackBlurGetElement(canvasIDOrElement);
  if (!canvas && !(canvas !== null && canvas !== void 0 && canvas.getContext)) return;
  var context = canvas.getContext('2d');
  var imageData = context === null || context === void 0 ? void 0 : context.getImageData(topX, topY, width, height);
  var pixels = imageData.data;
  var x;
  var y;
  var i;
  var p;
  var yp;
  var yi;
  var yw;
  var rSum;
  var gSum;
  var bSum;
  var rOutSum;
  var gOutSum;
  var bOutSum;
  var rInSum;
  var gInSum;
  var bInSum;
  var pr;
  var pg;
  var pb;
  var rbs;
  var stackEnd;
  var div = radius + radius + 1;
  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  for (i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i === radiusPlus1) stackEnd = stack;
  }
  stack.next = stackStart;
  var stackIn;
  var stackOut;
  yw = yi = 0;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];
  for (y = 0; y < height; y++) {
    rInSum = gInSum = bInSum = rSum = gSum = bSum = 0;
    rOutSum = radiusPlus1 * (pr = pixels[yi]);
    gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
    bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);
    rSum += sumFactor * pr;
    gSum += sumFactor * pg;
    bSum += sumFactor * pb;
    stack = stackStart;
    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }
    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      gSum += (stack.g = pg = pixels[p + 1]) * rbs;
      bSum += (stack.b = pb = pixels[p + 2]) * rbs;
      rInSum += pr;
      gInSum += pg;
      bInSum += pb;
      stack = stack.next;
    }
    stackIn = stackStart;
    stackOut = stackEnd;
    for (x = 0; x < width; x++) {
      pixels[yi] = rSum * mulSum >> shgSum;
      pixels[yi + 1] = gSum * mulSum >> shgSum;
      pixels[yi + 2] = bSum * mulSum >> shgSum;
      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[p];
      gInSum += stackIn.g = pixels[p + 1];
      bInSum += stackIn.b = pixels[p + 2];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      stackIn = stackIn.next;
      rOutSum += pr = stackOut.r;
      gOutSum += pg = stackOut.g;
      bOutSum += pb = stackOut.b;
      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }
    yw += width;
  }
  for (x = 0; x < width; x++) {
    gInSum = bInSum = rInSum = gSum = bSum = rSum = 0;
    yi = x << 2;
    rOutSum = radiusPlus1 * (pr = pixels[yi]);
    gOutSum = radiusPlus1 * (pg = pixels[yi + 1]);
    bOutSum = radiusPlus1 * (pb = pixels[yi + 2]);
    rSum += sumFactor * pr;
    gSum += sumFactor * pg;
    bSum += sumFactor * pb;
    stack = stackStart;
    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }
    yp = width;
    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;
      rSum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      gSum += (stack.g = pg = pixels[yi + 1]) * rbs;
      bSum += (stack.b = pb = pixels[yi + 2]) * rbs;
      rInSum += pr;
      gInSum += pg;
      bInSum += pb;
      stack = stack.next;
      if (i < heightMinus1) {
        yp += width;
      }
    }
    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;
    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = rSum * mulSum >> shgSum;
      pixels[p + 1] = gSum * mulSum >> shgSum;
      pixels[p + 2] = bSum * mulSum >> shgSum;
      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      rSum += rInSum += stackIn.r = pixels[p];
      gSum += gInSum += stackIn.g = pixels[p + 1];
      bSum += bInSum += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      rOutSum += pr = stackOut.r;
      gOutSum += pg = stackOut.g;
      bOutSum += pb = stackOut.b;
      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;
      stackOut = stackOut.next;
      yi += width;
    }
  }
  context === null || context === void 0 || context.putImageData(imageData, topX, topY);
};