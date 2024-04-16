import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var LOGO_3D = {
  path: 'assets/logo-3d.webp',
  pkg: '@lobehub/assets-logo',
  version: '1.2.0'
};
export var LOGO_FLAT = {
  path: 'assets/logo-flat.svg',
  pkg: '@lobehub/assets-logo',
  version: '1.2.0'
};
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    extraTitle: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      font-weight: 300;\n      white-space: nowrap;\n    "])))
  };
});