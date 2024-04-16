'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["type", "size", "style", "extra", "className"];
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useCdnFn } from "../ConfigProvider";
import Img from "../Img";
import Divider from "./Divider";
import LogoHighContrast from "./LogoHighContrast";
import LogoText from "./LogoText";
import { LOGO_3D, LOGO_FLAT, useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Logo = /*#__PURE__*/memo(function (_ref) {
  var _ref$type = _ref.type,
    type = _ref$type === void 0 ? '3d' : _ref$type,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 32 : _ref$size,
    style = _ref.style,
    extra = _ref.extra,
    className = _ref.className,
    rest = _objectWithoutProperties(_ref, _excluded);
  var genCdnUrl = useCdnFn();
  var theme = useTheme();
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var logoComponent;
  switch (type) {
    case '3d':
      {
        logoComponent = /*#__PURE__*/_jsx(Img, _objectSpread({
          alt: "lobehub",
          height: size,
          src: genCdnUrl(LOGO_3D),
          style: style,
          width: size
        }, rest));
        break;
      }
    case 'flat':
      {
        logoComponent = /*#__PURE__*/_jsx(Img, {
          alt: "lobehub",
          height: size,
          src: genCdnUrl(LOGO_FLAT),
          style: style,
          width: size
        });
        break;
      }
    case 'high-contrast':
      {
        logoComponent = /*#__PURE__*/_jsx(LogoHighContrast, _objectSpread({
          height: size,
          style: style,
          width: size
        }, rest));
        break;
      }
    case 'text':
      {
        logoComponent = /*#__PURE__*/_jsx(LogoText, _objectSpread({
          className: className,
          height: size,
          style: style,
          width: size * 2.9375
        }, rest));
        break;
      }
    case 'combine':
      {
        logoComponent = /*#__PURE__*/_jsxs(_Fragment, {
          children: [/*#__PURE__*/_jsx(Img, {
            alt: "lobehub",
            height: size,
            src: genCdnUrl(LOGO_3D),
            width: size
          }), /*#__PURE__*/_jsx(LogoText, {
            style: {
              height: size,
              marginLeft: Math.round(size / 4),
              width: 'auto'
            }
          })]
        });
        break;
      }
  }
  if (!extra) return logoComponent;
  var extraSize = Math.round(size / 3 * 1.9);
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'center',
    className: className,
    horizontal: true,
    style: style
  }, rest), {}, {
    children: [logoComponent, /*#__PURE__*/_jsx(Divider, {
      style: {
        color: theme.colorFill,
        height: extraSize,
        width: extraSize
      }
    }), /*#__PURE__*/_jsx("div", {
      className: styles.extraTitle,
      style: {
        fontSize: extraSize
      },
      children: extra
    })]
  }));
});
export default Logo;