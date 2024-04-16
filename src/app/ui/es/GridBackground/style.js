import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles, keyframes } from 'antd-style';
import chroma from 'chroma-js';
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css,
    token = _ref.token;
  var reverse = _ref2.reverse,
    _ref2$backgroundColor = _ref2.backgroundColor,
    backgroundColor = _ref2$backgroundColor === void 0 ? 'blue' : _ref2$backgroundColor;
  var highlightAnimation = keyframes(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    0% {\n      mask-position: 100% 0%;\n    }\n    16%,100% {\n      mask-position: 100% 200%;\n    }\n  "])));
  var highlightAnimationReverse = keyframes(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    0% {\n      mask-position: 100% 200%;\n    }\n    16%,100% {\n      mask-position: 100% 0%;\n    }\n  "])));
  var scale = chroma.bezier([token.colorText, backgroundColor, token.colorBgLayout]).scale().mode('lch').correctLightness().colors(6);
  var width = 24;
  var height = 36;
  return {
    background: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        position: absolute;\n        inset-block-start: ", "%;\n        inset-inline-start: ", "%;\n        transform: rotateX(60deg);\n\n        width: ", "%;\n        height: ", "%;\n\n        background: ", ";\n        filter: blur(2em) saturate(400%);\n        border-radius: 50%;\n        box-shadow:\n          0 0 1em 2em ", ",\n          0 0 3em 6em ", ",\n          0 0 6em 10em ", ",\n          0 0 8em 16em ", ";\n      "])), 60 - height / 2, 50 - width / 2, width, height, scale[1], scale[1], scale[2], scale[3], scale[4]),
    backgroundContainer: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        position: absolute;\n        z-index: -1;\n        inset: 0;\n\n        width: 100%;\n        height: 100%;\n\n        perspective: 200px;\n      "]))),
    container: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n        position: relative;\n\n        mask-image: linear-gradient(to bottom, transparent, #fff 30%, #fff 70%, transparent);\n        mask-size: cover;\n      "]))),
    highlight: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n        --duration: 6s;\n        --delay: 0s;\n\n        position: absolute;\n        z-index: 1;\n        inset: 0;\n\n        animation: ", " var(--duration)\n          cubic-bezier(0.62, 0.62, 0.28, 0.67) infinite;\n        animation-delay: var(--delay);\n\n        mask-image: linear-gradient(to bottom, transparent 40%, #fff 60%, transparent);\n        mask-size: 100% 200%;\n      "])), reverse ? highlightAnimationReverse : highlightAnimation)
  };
});