import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var cx = _ref.cx,
    css = _ref.css,
    responsive = _ref.responsive,
    token = _ref.token,
    stylish = _ref.stylish;
  return {
    actions: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    margin-block-start: 24px;\n\n    button {\n      padding-inline: 32px !important;\n      font-weight: 500;\n    }\n\n    ", " {\n      flex-direction: column;\n      gap: 16px;\n      width: 100%;\n      margin-block-start: 24px;\n\n      button {\n        width: 100%;\n      }\n    }\n  "])), responsive.mobile),
    canvas: cx(stylish.gradientAnimation, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      pointer-events: none;\n\n      position: absolute;\n      z-index: 10;\n      inset-block-start: -250px;\n      inset-inline-start: 50%;\n      transform: translateX(-50%) scale(1.5);\n\n      width: 600px;\n      height: 400px;\n\n      opacity: 0.2;\n      filter: blur(100px);\n\n      ", " {\n        width: 200px;\n        height: 300px;\n      }\n    "])), responsive.mobile)),
    container: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    position: relative;\n    box-sizing: border-box;\n    text-align: center;\n  "]))),
    desc: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    margin-block-start: 0;\n    font-size: ", "px;\n    color: ", ";\n    text-align: center;\n\n    ", " {\n      margin-block: 24px;\n      margin-inline: 16px;\n      font-size: ", "px;\n    }\n  "])), token.fontSizeHeading3, token.colorTextSecondary, responsive.mobile, token.fontSizeHeading5),
    title: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    z-index: 10;\n    margin: 0;\n    font-size: 100px;\n\n    ", "\n\n    b {\n      ", "\n      position: relative;\n      z-index: 5;\n      background-clip: text;\n\n      -webkit-text-fill-color: transparent;\n\n      &::selection {\n        -webkit-text-fill-color: #000 !important;\n      }\n    }\n  "])), responsive({
      mobile: {
        display: 'flex',
        flexDirection: 'column',
        fontSize: 72,
        lineHeight: 1.2
      }
    }), stylish.gradientAnimation)
  };
});