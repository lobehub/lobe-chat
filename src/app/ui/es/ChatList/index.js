'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["onActionsClick", "onAvatarsClick", "renderMessagesExtra", "className", "data", "type", "text", "showTitle", "onMessageChange", "renderMessages", "renderErrorMessages", "loadingId", "renderItems", "enableHistoryCount", "renderActions", "historyCount"];
import { Fragment, memo } from 'react';
import HistoryDivider from "./HistoryDivider";
import Item from "./Item";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ChatList = /*#__PURE__*/memo(function (_ref) {
  var onActionsClick = _ref.onActionsClick,
    onAvatarsClick = _ref.onAvatarsClick,
    renderMessagesExtra = _ref.renderMessagesExtra,
    className = _ref.className,
    data = _ref.data,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'chat' : _ref$type,
    text = _ref.text,
    showTitle = _ref.showTitle,
    onMessageChange = _ref.onMessageChange,
    renderMessages = _ref.renderMessages,
    renderErrorMessages = _ref.renderErrorMessages,
    loadingId = _ref.loadingId,
    renderItems = _ref.renderItems,
    enableHistoryCount = _ref.enableHistoryCount,
    renderActions = _ref.renderActions,
    _ref$historyCount = _ref.historyCount,
    historyCount = _ref$historyCount === void 0 ? 0 : _ref$historyCount,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("div", _objectSpread(_objectSpread({
    className: cx(styles.container, className)
  }, rest), {}, {
    children: data.map(function (item, index) {
      var itemProps = {
        loading: loadingId === item.id,
        onActionsClick: onActionsClick,
        onAvatarsClick: onAvatarsClick,
        onMessageChange: onMessageChange,
        renderActions: renderActions,
        renderErrorMessages: renderErrorMessages,
        renderItems: renderItems,
        renderMessages: renderMessages,
        renderMessagesExtra: renderMessagesExtra,
        showTitle: showTitle,
        text: text,
        type: type
      };
      var historyLength = data.length;
      var enableHistoryDivider = enableHistoryCount && historyLength > historyCount && historyCount === historyLength - index + 1;
      return /*#__PURE__*/_jsxs(Fragment, {
        children: [/*#__PURE__*/_jsx(HistoryDivider, {
          enable: enableHistoryDivider,
          text: text === null || text === void 0 ? void 0 : text.history
        }), /*#__PURE__*/_jsx(Item, _objectSpread(_objectSpread({}, itemProps), item))]
      }, item.id);
    })
  }));
});
export default ChatList;