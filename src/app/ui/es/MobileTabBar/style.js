import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    active: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      color: ", ";\n    "])), token.colorPrimary),
    container: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: hidden;\n      flex: none;\n      user-select: none;\n\n      width: 100vw;\n\n      background: ", ";\n      border-block-start: 1px solid ", ";\n    "])), token.colorBgLayout, rgba(token.colorBorder, 0.25)),
    icon: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      width: 24px;\n      height: 24px;\n      font-size: 24px;\n    "]))),
    inner: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      position: relative;\n      width: 100%;\n      height: 48px;\n    "]))),
    tab: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      cursor: pointer;\n      width: 48px;\n      height: 48px;\n      color: ", ";\n    "])), token.colorTextSecondary),
    title: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n      overflow: hidden;\n\n      width: 100%;\n\n      font-size: 12px;\n      line-height: 1.125em;\n      margin-top: -0.125em;\n      text-align: center;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    "])))
  };
});