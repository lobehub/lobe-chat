import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["className", "icon", "title", "children", "extra", "itemsType", "variant", "defaultActive"];
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12;
import { Collapse } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { ChevronDown } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var useStyles = createStyles(function (_ref, variant) {
  var css = _ref.css,
    cx = _ref.cx,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode,
    responsive = _ref.responsive,
    prefixCls = _ref.prefixCls;
  var pureStyle = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      background: transparent;\n      border: none;\n      border-radius: 0;\n\n      .", "-collapse-header {\n        background: transparent !important;\n        border-radius: 0 !important;\n      }\n\n      .", "-collapse-content-box {\n        background: transparent;\n        border-radius: 0;\n      }\n    "])), prefixCls, prefixCls);
  var blockStyle = css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      background: ", ";\n      border: none;\n      border-radius: ", "px;\n\n      .", "-collapse-content {\n        border: none !important;\n      }\n    "])), token.colorFillQuaternary, token.borderRadiusLG, prefixCls);
  var ghostStyle = css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      background: transparent;\n      border: 1px solid ", ";\n      .", "-collapse-header {\n        background: transparent !important;\n      }\n\n      .", "-collapse-content-box {\n        background: transparent;\n      }\n    "])), token.colorBorderSecondary, prefixCls, prefixCls);
  var defaultStyle = css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      background: ", ";\n      border: 1px solid ", ";\n      border-radius: ", "px;\n    "])), token.colorFillQuaternary, token.colorBorderSecondary, token.borderRadiusLG);
  var variantStyle = cx(variant === 'default' && defaultStyle, variant === 'block' && blockStyle, variant === 'ghost' && ghostStyle, variant === 'pure' && pureStyle);
  return {
    flatGroup: cx(css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          overflow: hidden;\n          padding-inline: 16px;\n        "]))), variantStyle),
    group: cx(isDarkMode && css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n            .", "-collapse-content {\n              background: transparent;\n              border-color: ", ";\n            }\n\n            .", "-collapse-header {\n              background: ", ";\n            }\n          "])), prefixCls, token.colorBorderSecondary, prefixCls, token.colorFillTertiary), css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n          overflow: hidden;\n          flex: none;\n\n          .", "-collapse-item {\n            border: none;\n          }\n\n          .", "-collapse-header {\n            align-items: center !important;\n            border-radius: 0 !important;\n          }\n\n          .", "-collapse-content-box {\n            padding-block: 0 !important;\n          }\n\n          .", "-form-item-label {\n            display: flex;\n            flex-direction: column;\n            justify-content: center;\n          }\n        "])), prefixCls, prefixCls, prefixCls, prefixCls), variantStyle),
    icon: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n        transition: all 100ms ", ";\n      "])), token.motionEaseOut),
    mobileFlatGroup: css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n        border-radius: ", "px;\n      "])), token.borderRadiusLG),
    mobileGroupBody: css(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["\n        padding-block: 0;\n        padding-inline: 16px;\n        background: ", ";\n      "])), token.colorBgContainer),
    mobileGroupHeader: css(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["\n        padding: 16px;\n        background: ", ";\n      "])), token.colorBgLayout),
    title: css(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n        align-items: center;\n        font-size: 16px;\n        font-weight: 600;\n\n        .anticon {\n          color: ", ";\n        }\n\n        ", " {\n          font-size: 14px;\n          font-weight: 400;\n          opacity: 0.5;\n        }\n      "])), token.colorPrimary, responsive.mobile)
  };
});
var FormGroup = /*#__PURE__*/memo(function (_ref2) {
  var className = _ref2.className,
    icon = _ref2.icon,
    title = _ref2.title,
    children = _ref2.children,
    extra = _ref2.extra,
    itemsType = _ref2.itemsType,
    _ref2$variant = _ref2.variant,
    variant = _ref2$variant === void 0 ? 'default' : _ref2$variant,
    _ref2$defaultActive = _ref2.defaultActive,
    defaultActive = _ref2$defaultActive === void 0 ? true : _ref2$defaultActive,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles(variant),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var titleContent = /*#__PURE__*/_jsxs(Flexbox, {
    className: styles.title,
    gap: 8,
    horizontal: true,
    children: [icon && /*#__PURE__*/_jsx(Icon, {
      icon: icon
    }), title]
  });
  if (itemsType === 'flat') {
    if (mobile) return /*#__PURE__*/_jsx(Flexbox, {
      className: cx(styles.mobileFlatGroup, styles.mobileGroupBody, className),
      children: children
    });
    return /*#__PURE__*/_jsx(Flexbox, {
      className: cx(styles.flatGroup, className),
      children: children
    });
  }
  if (mobile) return /*#__PURE__*/_jsxs(Flexbox, {
    className: className,
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      className: styles.mobileGroupHeader,
      horizontal: true,
      justify: 'space-between',
      children: [titleContent, extra]
    }), /*#__PURE__*/_jsx("div", {
      className: styles.mobileGroupBody,
      children: children
    })]
  });
  return /*#__PURE__*/_jsx(Collapse, _objectSpread({
    className: cx(styles.group, className),
    defaultActiveKey: defaultActive ? [1] : undefined,
    expandIcon: function expandIcon(_ref3) {
      var isActive = _ref3.isActive;
      return /*#__PURE__*/_jsx(Icon, {
        className: styles.icon,
        icon: ChevronDown,
        size: {
          fontSize: 16
        },
        style: isActive ? {} : {
          rotate: '-90deg'
        }
      });
    },
    items: [{
      children: children,
      extra: extra,
      key: 1,
      label: titleContent
    }]
  }, rest), 1);
});
export default FormGroup;