'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["allowFullscreen", "children", "title", "className", "wrapClassName", "width", "onCancel", "open", "destroyOnClose", "paddings", "maxHeight", "footer", "styles"],
  _excluded2 = ["body"];
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { Modal as AntModal, ConfigProvider, Drawer } from 'antd';
import { createStyles, useResponsive } from 'antd-style';
import { isNumber } from 'lodash-es';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { lighten } from 'polished';
import { memo, useState } from 'react';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
var HEADER_HEIGHT = 56;
var FOOTER_HEIGHT = 68;
var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  var maxHeight = _ref2.maxHeight;
  return {
    content: cx(maxHeight && css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n            .", "-modal-body {\n              overflow: auto;\n              max-height: ", ";\n            }\n          "])), prefixCls, maxHeight), css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n          .", "-modal-footer {\n            margin: 0;\n            padding: 16px;\n          }\n          .", "-modal-header {\n            display: flex;\n            gap: 4px;\n            align-items: center;\n            justify-content: center;\n\n            height: 56px;\n            margin-block-end: 0;\n            padding: 16px;\n          }\n          .", "-modal-content {\n            overflow: hidden;\n            padding: 0;\n            border: 1px solid ", ";\n            border-radius: ", "px;\n          }\n        "])), prefixCls, prefixCls, prefixCls, token.colorSplit, token.borderRadiusLG)),
    drawerContent: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        .", "-drawer-close {\n          padding: 0;\n        }\n        .", "-drawer-wrapper-body {\n          background: linear-gradient(to bottom, ", ", ", ");\n        }\n        .", "-drawer-header {\n          padding: 8px;\n        }\n\n        .", "-drawer-footer {\n          display: flex;\n          align-items: center;\n          justify-content: flex-end;\n\n          padding: 16px;\n\n          border: none;\n        }\n      "])), prefixCls, prefixCls, token.colorBgContainer, token.colorBgLayout, prefixCls, prefixCls),
    wrap: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        overflow: hidden auto;\n        backdrop-filter: blur(2px);\n      "])))
  };
});
var Modal = /*#__PURE__*/memo(function (_ref3) {
  var _paddings$desktop, _paddings$desktop2;
  var allowFullscreen = _ref3.allowFullscreen,
    children = _ref3.children,
    _ref3$title = _ref3.title,
    title = _ref3$title === void 0 ? ' ' : _ref3$title,
    className = _ref3.className,
    wrapClassName = _ref3.wrapClassName,
    _ref3$width = _ref3.width,
    width = _ref3$width === void 0 ? 700 : _ref3$width,
    onCancel = _ref3.onCancel,
    open = _ref3.open,
    destroyOnClose = _ref3.destroyOnClose,
    paddings = _ref3.paddings,
    _ref3$maxHeight = _ref3.maxHeight,
    maxHeight = _ref3$maxHeight === void 0 ? '75dvh' : _ref3$maxHeight,
    footer = _ref3.footer,
    _ref3$styles = _ref3.styles,
    stylesProps = _ref3$styles === void 0 ? {} : _ref3$styles,
    rest = _objectWithoutProperties(_ref3, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    fullscreen = _useState2[0],
    setFullscreen = _useState2[1];
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles({
      maxHeight: maxHeight ? "calc(".concat(isNumber(maxHeight) ? "".concat(maxHeight, "px") : maxHeight, " - ").concat(HEADER_HEIGHT + (footer ? FOOTER_HEIGHT : 0), "px)") : undefined
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx,
    theme = _useStyles.theme;
  var body = stylesProps.body,
    restStyles = _objectWithoutProperties(stylesProps, _excluded2);
  if (mobile) return /*#__PURE__*/_jsx(Drawer, {
    className: cx(styles.drawerContent, className),
    closeIcon: /*#__PURE__*/_jsx(ActionIcon, {
      icon: X
    }),
    destroyOnClose: destroyOnClose,
    extra: allowFullscreen && /*#__PURE__*/_jsx(ActionIcon, {
      icon: fullscreen ? Minimize2 : Maximize2,
      onClick: function onClick() {
        return setFullscreen(!fullscreen);
      }
    }),
    footer: footer,
    height: fullscreen ? '100dvh' : maxHeight || '75vh',
    maskClassName: cx(styles.wrap, wrapClassName),
    onClose: onCancel,
    open: open,
    placement: 'bottom',
    styles: _objectSpread({
      body: _objectSpread({
        paddingBlock: "16px ".concat(footer ? 0 : '16px'),
        paddingInline: (_paddings$desktop = paddings === null || paddings === void 0 ? void 0 : paddings.desktop) !== null && _paddings$desktop !== void 0 ? _paddings$desktop : 16
      }, body)
    }, restStyles),
    title: title,
    children: children
  });
  return /*#__PURE__*/_jsx(ConfigProvider, {
    theme: {
      token: {
        colorBgElevated: lighten(0.005, theme.colorBgContainer)
      }
    },
    children: /*#__PURE__*/_jsx(AntModal, _objectSpread(_objectSpread({
      className: cx(styles.content, className),
      closable: true,
      closeIcon: /*#__PURE__*/_jsx(Icon, {
        icon: X,
        size: {
          fontSize: 20
        }
      }),
      destroyOnClose: destroyOnClose,
      footer: footer,
      maskClosable: true,
      onCancel: onCancel,
      open: open,
      styles: _objectSpread({
        body: _objectSpread({
          paddingBlock: "0 ".concat(footer === null ? '16px' : 0),
          paddingInline: (_paddings$desktop2 = paddings === null || paddings === void 0 ? void 0 : paddings.desktop) !== null && _paddings$desktop2 !== void 0 ? _paddings$desktop2 : 16
        }, body)
      }, restStyles),
      title: title,
      width: width,
      wrapClassName: cx(styles.wrap, wrapClassName)
    }, rest), {}, {
      children: children
    }))
  });
});
export default Modal;