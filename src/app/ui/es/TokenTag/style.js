import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
var HEIGHT = 28;
export var ICON_SIZE = 20;
export var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode;
  var type = _ref2.type,
    shape = _ref2.shape;
  var percentStyle;
  switch (type) {
    case 'normal':
      {
        percentStyle = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n          color: ", ";\n        "])), token.colorSuccessText);
        break;
      }
    case 'low':
      {
        percentStyle = css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          color: ", ";\n        "])), token.colorWarningText);
        break;
      }
    case 'overload':
      {
        percentStyle = css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          color: ", ";\n        "])), token.colorErrorText);
        break;
      }
  }
  var roundStylish = css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      padding-block: 0;\n      padding-inline: ", "px ", "px;\n      background: ", ";\n      border-radius: ", "px;\n    "])), (HEIGHT - ICON_SIZE) / 2, (HEIGHT - ICON_SIZE) * 1.2, isDarkMode ? token.colorFillSecondary : token.colorFillTertiary, HEIGHT / 2);
  var squareStylish = css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      border-radius: ", "px;\n    "])), token.borderRadiusSM);
  return {
    container: cx(percentStyle, shape === 'round' ? roundStylish : squareStylish, css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n          user-select: none;\n\n          overflow: hidden;\n\n          min-width: fit-content;\n          height: ", "px;\n\n          font-family: ", ";\n          font-size: 13px;\n          line-height: 1;\n        "])), HEIGHT, token.fontFamilyCode))
  };
});