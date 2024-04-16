import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, headerHeight) {
  var css = _ref.css,
    stylish = _ref.stylish,
    responsive = _ref.responsive;
  var baseGlass = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    pointer-events: none;\n    content: '';\n    user-select: none;\n\n    position: absolute;\n    z-index: -1;\n    inset-block: -1px ", ";\n    inset-inline: 0;\n  "])), responsive.mobile ? '-25%' : '-50%');
  return {
    app: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: hidden auto;\n      height: 100dvh;\n    "]))),
    aside: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      position: sticky;\n      z-index: 2;\n      height: 100%;\n    "]))),
    asideInner: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      overflow: hidden auto;\n      width: 100%;\n      height: calc(100dvh - ", "px);\n    "])), headerHeight),
    content: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      position: relative;\n      flex: 1;\n      max-width: 100%;\n    "]))),
    footer: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n      position: relative;\n      max-width: 100%;\n    "]))),
    glass: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n      z-index: 0;\n\n      &::before {\n        ", ";\n        ", ";\n        mask-image: linear-gradient(to bottom, black ", "px, transparent);\n      }\n\n      &::after {\n        ", ";\n      }\n    "])), stylish.blur, baseGlass, headerHeight, baseGlass),
    header: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n      position: sticky;\n      z-index: 999;\n      inset-block-start: 0;\n      max-width: 100%;\n    "]))),
    main: css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n      position: relative;\n      display: flex;\n      align-items: stretch;\n      max-width: 100vw;\n    "]))),
    toc: css(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral([""])))
  };
});