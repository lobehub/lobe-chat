import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding: 0;\n      list-style: none;\n    "]))),
    item: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      box-sizing: border-box;\n      list-style: none;\n    "])))
  };
});