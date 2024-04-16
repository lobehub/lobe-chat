import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref, _ref2) {
  var token = _ref.token,
    stylish = _ref.stylish,
    responsive = _ref.responsive,
    cx = _ref.cx,
    css = _ref.css,
    prefixCls = _ref.prefixCls;
  var tocWidth = _ref2.tocWidth,
    headerHeight = _ref2.headerHeight;
  var fixHeight = 36;
  return {
    anchor: cx(stylish.blur, css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n          overflow: hidden auto;\n          max-height: 60dvh !important;\n        "])))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        position: sticky;\n        inset-block-start: ", "px;\n\n        overscroll-behavior: contain;\n        grid-area: toc;\n\n        width: ", "px;\n        margin-inline-end: 24px;\n\n        border-radius: 3px;\n\n        -webkit-overflow-scrolling: touch;\n\n        ", " {\n          position: relative;\n          inset-inline-start: 0;\n          width: 100%;\n          margin-block-start: 0;\n        }\n\n        > h4 {\n          margin-block: 0 8px;\n          margin-inline: 0;\n\n          font-size: 12px;\n          line-height: 1;\n          color: ", ";\n        }\n      "])), headerHeight + 64, tocWidth, responsive.mobile, token.colorTextDescription),
    expand: cx(stylish.blur, css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          width: 100%;\n\n          background-color: ", ";\n          border-block-end: 1px solid ", ";\n          border-radius: 0;\n          box-shadow: ", ";\n\n          .", "-collapse-content {\n            overflow: auto;\n          }\n\n          .", "-collapse-header {\n            z-index: 10;\n            padding-block: 8px !important;\n            padding-inline: 16px !important;\n          }\n        "])), rgba(token.colorBgLayout, 0.5), token.colorSplit, token.boxShadowSecondary, prefixCls, prefixCls)),
    mobileCtn: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        width: 100%;\n        height: ", "px;\n\n        .", "-collapse-expand-icon {\n          color: ", ";\n        }\n      "])), fixHeight, prefixCls, token.colorTextQuaternary)
  };
});