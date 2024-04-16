'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["wrapperClassName", "style", "preview", "isLoading", "minSize", "size", "actions", "alwaysShowActions", "objectFit", "classNames", "onClick", "width", "height", "borderless"];
import { Image as AntImage, Skeleton } from 'antd';
import { useResponsive, useThemeMode } from 'antd-style';
import { Eye } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../Icon";
import { useStyles } from "./style";
import usePreview from "./usePreview";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Image = /*#__PURE__*/memo(function (_ref) {
  var wrapperClassName = _ref.wrapperClassName,
    style = _ref.style,
    preview = _ref.preview,
    isLoading = _ref.isLoading,
    _ref$minSize = _ref.minSize,
    minSize = _ref$minSize === void 0 ? 64 : _ref$minSize,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? '100%' : _ref$size,
    actions = _ref.actions,
    alwaysShowActions = _ref.alwaysShowActions,
    _ref$objectFit = _ref.objectFit,
    objectFit = _ref$objectFit === void 0 ? 'cover' : _ref$objectFit,
    _ref$classNames = _ref.classNames,
    classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
    onClick = _ref.onClick,
    width = _ref.width,
    height = _ref.height,
    borderless = _ref.borderless,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useThemeMode = useThemeMode(),
    isDarkMode = _useThemeMode.isDarkMode;
  var _useStyles = useStyles({
      alwaysShowActions: alwaysShowActions,
      borderless: borderless,
      minSize: minSize,
      objectFit: objectFit,
      size: size
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx,
    theme = _useStyles.theme;
  var mergePreivew = usePreview(preview);
  if (isLoading) return /*#__PURE__*/_jsx("div", {
    onClick: onClick,
    children: /*#__PURE__*/_jsx(Skeleton.Avatar, {
      active: true,
      style: {
        borderRadius: theme.borderRadius,
        height: height,
        maxHeight: size,
        maxWidth: size,
        minHeight: minSize,
        minWidth: minSize,
        width: width
      }
    })
  });
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: cx(styles.imageWrapper, wrapperClassName),
    style: style,
    children: [actions && /*#__PURE__*/_jsx("div", {
      className: styles.actions,
      children: actions
    }), /*#__PURE__*/_jsx(AntImage, _objectSpread({
      className: classNames.image,
      fallback: isDarkMode ? 'https://gw.alipayobjects.com/zos/kitchen/nhzBb%24r0Cm/image_off_dark.webp' : 'https://gw.alipayobjects.com/zos/kitchen/QAvkgt30Ys/image_off_light.webp',
      height: height,
      loading: 'lazy',
      onClick: onClick,
      preview: preview === false ? false : _objectSpread({
        mask: mobile ? false : actions ? /*#__PURE__*/_jsx("div", {}) : /*#__PURE__*/_jsx(Icon, {
          icon: Eye,
          size: 'normal'
        })
      }, mergePreivew),
      width: width,
      wrapperClassName: cx(styles.image, classNames.wrapper)
    }, rest))]
  });
});
export default Image;