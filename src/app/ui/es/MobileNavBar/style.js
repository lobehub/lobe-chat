import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    center: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      height: 100%;\n    "]))),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: hidden;\n      flex: none;\n      width: 100vw;\n      background: ", ";\n    "])), token.colorBgLayout),
    inner: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      position: relative;\n\n      width: 100%;\n      height: 44px;\n      min-height: 44px;\n      max-height: 44px;\n      padding-block: 0;\n      padding-inline: 6px;\n    "]))),
    left: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      justify-content: flex-start;\n      height: 100%;\n    "]))),
    right: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      justify-content: flex-end;\n      height: 100%;\n    "])))
  };
});