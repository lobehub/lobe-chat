'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["active", "avatar", "loading", "description", "date", "title", "onHoverChange", "actions", "className", "style", "showAction", "children", "classNames", "addon", "pin"];
import { Loader2, MessageSquare } from 'lucide-react';
import { forwardRef } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../../Icon";
import { useStyles } from "./style";
import { getChatItemTime } from "./time";

/**
 * 卡片列表项的属性
 */
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var ListItem = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var active = _ref.active,
    avatar = _ref.avatar,
    loading = _ref.loading,
    description = _ref.description,
    date = _ref.date,
    title = _ref.title,
    onHoverChange = _ref.onHoverChange,
    actions = _ref.actions,
    className = _ref.className,
    style = _ref.style,
    showAction = _ref.showAction,
    children = _ref.children,
    classNames = _ref.classNames,
    addon = _ref.addon,
    pin = _ref.pin,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'flex-start',
    className: cx(styles.container, active && styles.active, className),
    distribution: 'space-between',
    gap: 8,
    horizontal: true,
    onMouseEnter: function onMouseEnter() {
      onHoverChange === null || onHoverChange === void 0 || onHoverChange(true);
    },
    onMouseLeave: function onMouseLeave() {
      onHoverChange === null || onHoverChange === void 0 || onHoverChange(false);
    },
    padding: 12,
    ref: ref,
    style: style
  }, rest), {}, {
    children: [pin && /*#__PURE__*/_jsx("div", {
      className: styles.pin,
      children: /*#__PURE__*/_jsx("div", {
        className: styles.triangle
      })
    }), avatar !== null && avatar !== void 0 ? avatar : /*#__PURE__*/_jsx(Icon, {
      icon: MessageSquare,
      style: {
        marginTop: 4
      }
    }), /*#__PURE__*/_jsxs(Flexbox, {
      className: styles.content,
      gap: 8,
      children: [/*#__PURE__*/_jsx(Flexbox, {
        distribution: 'space-between',
        horizontal: true,
        children: /*#__PURE__*/_jsx("div", {
          className: styles.title,
          children: title
        })
      }), description && /*#__PURE__*/_jsx("div", {
        className: styles.desc,
        children: description
      }), addon]
    }), loading ? /*#__PURE__*/_jsx(Icon, {
      icon: Loader2,
      spin: true
    }) : /*#__PURE__*/_jsxs(_Fragment, {
      children: [showAction && /*#__PURE__*/_jsx(Flexbox, {
        className: styles.actions,
        gap: 4,
        horizontal: true,
        onClick: function onClick(e) {
          e.preventDefault();
          e.stopPropagation();
        },
        style: {
          display: showAction ? undefined : 'none'
        },
        children: actions
      }), date && /*#__PURE__*/_jsx("div", {
        className: cx(styles.time, classNames === null || classNames === void 0 ? void 0 : classNames.time),
        style: showAction ? {
          opacity: 0
        } : {},
        children: getChatItemTime(date)
      })]
    }), children]
  }));
});
export default ListItem;