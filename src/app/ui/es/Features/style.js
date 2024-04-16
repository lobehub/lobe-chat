import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var token = _ref.token,
    prefixCls = _ref.prefixCls,
    css = _ref.css,
    cx = _ref.cx;
  var rowNum = _ref2.rowNum,
    hasLink = _ref2.hasLink;
  var prefix = "".concat(prefixCls, "-features");
  var coverCls = "".concat(prefix, "-cover");
  var descCls = "".concat(prefix, "-description");
  var titleCls = "".concat(prefix, "-title");
  var imgCls = "".concat(prefix, "-img");
  var scaleUnit = 20;
  var genSize = function genSize(size) {
    return css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      width: ", "px;\n      height: ", "px;\n      font-size: ", "px;\n    "])), size, size, size * (22 / 24));
  };
  var withTransition = css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      transition: all ", " ", ";\n    "])), token.motionDurationSlow, token.motionEaseInOutCirc);
  return {
    cell: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        overflow: hidden;\n      "]))),
    container: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        ", ";\n        position: relative;\n        z-index: 1;\n\n        padding: 24px;\n        height: 228px;\n        max-height: 228px;\n\n        overflow: hidden;\n\n        p {\n          font-size: 16px;\n          line-height: 1.2;\n          text-align: start;\n          word-break: break-word;\n        }\n\n        &:hover {\n          .", " {\n            width: 100%;\n            height: ", "px;\n            padding: 0;\n            background: ", ";\n          }\n\n          .", " {\n            ", ";\n          }\n\n          .", " {\n            position: absolute;\n            visibility: hidden;\n            opacity: 0;\n          }\n\n          .", " {\n            font-size: ", "px;\n          }\n        }\n      "])), withTransition, coverCls, scaleUnit * rowNum, token.colorFillContent, imgCls, genSize(100), descCls, titleCls, hasLink ? 14 : 20),
    desc: cx(descCls, withTransition, css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          pointer-events: none;\n          color: ", ";\n\n          quotient {\n            position: relative;\n\n            display: block;\n\n            margin-block: 12px;\n            margin-inline: 0;\n            padding-inline-start: 12px;\n\n            color: ", ";\n          }\n        "])), token.colorTextSecondary, token.colorTextDescription)),
    img: cx(imgCls, withTransition, css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n          ", ";\n          color: ", ";\n        "])), genSize(20), token.colorText)),
    imgContainer: cx(coverCls, withTransition, css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n          ", ";\n          padding: 4px;\n          opacity: 0.8;\n          border-radius: ", "px;\n        "])), genSize(24), token.borderRadius)),
    link: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n        ", ";\n        margin-block-start: 24px;\n      "])), withTransition),
    title: cx(titleCls, withTransition, css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n          pointer-events: none;\n\n          margin-block: 16px;\n          margin-inline: 0;\n\n          font-size: 20px;\n          line-height: ", ";\n          color: ", ";\n        "])), token.lineHeightHeading3, token.colorText))
  };
});