'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["avatarAddon", "onAvatarClick", "avatarProps", "actions", "className", "primary", "loading", "message", "placement", "type", "avatar", "error", "showTitle", "time", "editing", "onChange", "onEditingChange", "messageExtra", "renderMessage", "text", "errorMessage", "onDoubleClick", "fontSize"];
import { useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Actions from "./components/Actions";
import Avatar from "./components/Avatar";
import BorderSpacing from "./components/BorderSpacing";
import ErrorContent from "./components/ErrorContent";
import MessageContent from "./components/MessageContent";
import Title from "./components/Title";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var MOBILE_AVATAR_SIZE = 32;
var ChatItem = /*#__PURE__*/memo(function (_ref) {
  var avatarAddon = _ref.avatarAddon,
    onAvatarClick = _ref.onAvatarClick,
    avatarProps = _ref.avatarProps,
    actions = _ref.actions,
    className = _ref.className,
    primary = _ref.primary,
    loading = _ref.loading,
    message = _ref.message,
    _ref$placement = _ref.placement,
    placement = _ref$placement === void 0 ? 'left' : _ref$placement,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'block' : _ref$type,
    avatar = _ref.avatar,
    error = _ref.error,
    showTitle = _ref.showTitle,
    time = _ref.time,
    editing = _ref.editing,
    onChange = _ref.onChange,
    onEditingChange = _ref.onEditingChange,
    messageExtra = _ref.messageExtra,
    renderMessage = _ref.renderMessage,
    text = _ref.text,
    errorMessage = _ref.errorMessage,
    onDoubleClick = _ref.onDoubleClick,
    fontSize = _ref.fontSize,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles({
      editing: editing,
      placement: placement,
      primary: primary,
      showTitle: showTitle,
      time: time,
      title: avatar.title,
      type: type
    }),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    direction: placement === 'left' ? 'horizontal' : 'horizontal-reverse',
    gap: mobile ? 6 : 12
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(Avatar, _objectSpread(_objectSpread({}, avatarProps), {}, {
      addon: avatarAddon,
      avatar: avatar,
      loading: loading,
      onClick: onAvatarClick,
      placement: placement,
      size: mobile ? MOBILE_AVATAR_SIZE : undefined
    })), /*#__PURE__*/_jsxs(Flexbox, {
      align: placement === 'left' ? 'flex-start' : 'flex-end',
      className: styles.messageContainer,
      children: [/*#__PURE__*/_jsx(Title, {
        avatar: avatar,
        placement: placement,
        showTitle: showTitle,
        time: time
      }), /*#__PURE__*/_jsxs(Flexbox, {
        align: placement === 'left' ? 'flex-start' : 'flex-end',
        className: styles.messageContent,
        direction: type === 'block' ? placement === 'left' ? 'horizontal' : 'horizontal-reverse' : 'vertical',
        gap: 8,
        children: [error ? /*#__PURE__*/_jsx(ErrorContent, {
          error: error,
          message: errorMessage,
          placement: placement
        }) : /*#__PURE__*/_jsx(MessageContent, {
          editing: editing,
          fontSize: fontSize,
          message: message,
          messageExtra: messageExtra,
          onChange: onChange,
          onDoubleClick: onDoubleClick,
          onEditingChange: onEditingChange,
          placement: placement,
          primary: primary,
          renderMessage: renderMessage,
          text: text,
          type: type
        }), /*#__PURE__*/_jsx(Actions, {
          actions: actions,
          editing: editing,
          placement: placement,
          type: type
        })]
      })]
    }), mobile && type === 'block' && /*#__PURE__*/_jsx(BorderSpacing, {
      borderSpacing: MOBILE_AVATAR_SIZE
    })]
  }));
});
export default ChatItem;