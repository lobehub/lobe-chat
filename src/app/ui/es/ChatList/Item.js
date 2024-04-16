import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["renderMessagesExtra", "showTitle", "onActionsClick", "onAvatarsClick", "onMessageChange", "type", "text", "renderMessages", "renderErrorMessages", "renderActions", "loading", "groupNav", "renderItems"];
import { App } from 'antd';
import { memo, useCallback, useMemo, useState } from 'react';
import ChatItem from "../ChatItem";
import { copyToClipboard } from "../utils/copyToClipboard";
import ActionsBar from "./ActionsBar";
import { jsx as _jsx } from "react/jsx-runtime";
var Item = /*#__PURE__*/memo(function (props) {
  var _item$error2;
  var renderMessagesExtra = props.renderMessagesExtra,
    showTitle = props.showTitle,
    onActionsClick = props.onActionsClick,
    onAvatarsClick = props.onAvatarsClick,
    onMessageChange = props.onMessageChange,
    type = props.type,
    text = props.text,
    renderMessages = props.renderMessages,
    renderErrorMessages = props.renderErrorMessages,
    renderActions = props.renderActions,
    loading = props.loading,
    groupNav = props.groupNav,
    renderItems = props.renderItems,
    item = _objectWithoutProperties(props, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    editing = _useState2[0],
    setEditing = _useState2[1];
  var _App$useApp = App.useApp(),
    message = _App$useApp.message;
  var RenderItem = useMemo(function () {
    if (!renderItems || !(item !== null && item !== void 0 && item.role)) return;
    var renderFunction;
    if (renderItems !== null && renderItems !== void 0 && renderItems[item.role]) renderFunction = renderItems[item.role];
    if (!renderFunction && renderItems !== null && renderItems !== void 0 && renderItems['default']) renderFunction = renderItems['default'];
    if (!renderFunction) return;
    return renderFunction;
  }, [renderItems === null || renderItems === void 0 ? void 0 : renderItems[item.role]]);
  var RenderMessage = useCallback(function (_ref) {
    var editableContent = _ref.editableContent,
      data = _ref.data;
    if (!renderMessages || !(item !== null && item !== void 0 && item.role)) return;
    var RenderFunction;
    if (renderMessages !== null && renderMessages !== void 0 && renderMessages[item.role]) RenderFunction = renderMessages[item.role];
    if (!RenderFunction && renderMessages !== null && renderMessages !== void 0 && renderMessages['default']) RenderFunction = renderMessages['default'];
    if (!RenderFunction) return;
    return /*#__PURE__*/_jsx(RenderFunction, _objectSpread(_objectSpread({}, data), {}, {
      editableContent: editableContent
    }));
  }, [renderMessages === null || renderMessages === void 0 ? void 0 : renderMessages[item.role]]);
  var MessageExtra = useCallback(function (_ref2) {
    var data = _ref2.data;
    if (!renderMessagesExtra || !(item !== null && item !== void 0 && item.role)) return;
    var RenderFunction;
    if (renderMessagesExtra !== null && renderMessagesExtra !== void 0 && renderMessagesExtra[item.role]) RenderFunction = renderMessagesExtra[item.role];
    if (renderMessagesExtra !== null && renderMessagesExtra !== void 0 && renderMessagesExtra['default']) RenderFunction = renderMessagesExtra['default'];
    if (!RenderFunction) return;
    return /*#__PURE__*/_jsx(RenderFunction, _objectSpread({}, data));
  }, [renderMessagesExtra === null || renderMessagesExtra === void 0 ? void 0 : renderMessagesExtra[item.role]]);
  var ErrorMessage = useCallback(function (_ref3) {
    var _item$error;
    var data = _ref3.data;
    if (!renderErrorMessages || !(item !== null && item !== void 0 && (_item$error = item.error) !== null && _item$error !== void 0 && _item$error.type)) return;
    var RenderFunction;
    if (renderErrorMessages !== null && renderErrorMessages !== void 0 && renderErrorMessages[item.error.type]) RenderFunction = renderErrorMessages[item.error.type].Render;
    if (!RenderFunction && renderErrorMessages !== null && renderErrorMessages !== void 0 && renderErrorMessages['default']) RenderFunction = renderErrorMessages['default'].Render;
    if (!RenderFunction) return;
    return /*#__PURE__*/_jsx(RenderFunction, _objectSpread({}, data));
  }, [renderErrorMessages === null || renderErrorMessages === void 0 ? void 0 : renderErrorMessages[item === null || item === void 0 || (_item$error2 = item.error) === null || _item$error2 === void 0 ? void 0 : _item$error2.type]]);
  var Actions = useCallback(function (_ref4) {
    var data = _ref4.data;
    if (!renderActions || !(item !== null && item !== void 0 && item.role)) return;
    var RenderFunction;
    if (renderActions !== null && renderActions !== void 0 && renderActions[item.role]) RenderFunction = renderActions[item.role];
    if (renderActions !== null && renderActions !== void 0 && renderActions['default']) RenderFunction = renderActions['default'];
    if (!RenderFunction) RenderFunction = ActionsBar;
    var handleActionClick = /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(action, data) {
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = action.key;
              _context.next = _context.t0 === 'copy' ? 3 : _context.t0 === 'edit' ? 7 : 8;
              break;
            case 3:
              _context.next = 5;
              return copyToClipboard(data.content);
            case 5:
              message.success((text === null || text === void 0 ? void 0 : text.copySuccess) || 'Copy Success');
              return _context.abrupt("break", 8);
            case 7:
              setEditing(true);
            case 8:
              onActionsClick === null || onActionsClick === void 0 || onActionsClick(action, data);
            case 9:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return function handleActionClick(_x, _x2) {
        return _ref5.apply(this, arguments);
      };
    }();
    return /*#__PURE__*/_jsx(RenderFunction, _objectSpread(_objectSpread({}, data), {}, {
      onActionClick: function onActionClick(actionKey) {
        return handleActionClick === null || handleActionClick === void 0 ? void 0 : handleActionClick(actionKey, data);
      },
      text: text
    }));
  }, [renderActions === null || renderActions === void 0 ? void 0 : renderActions[item.role], text, onActionsClick]);
  var error = useMemo(function () {
    var _item$error3;
    if (!item.error) return;
    var message = (_item$error3 = item.error) === null || _item$error3 === void 0 ? void 0 : _item$error3.message;
    var alertConfig = {};
    if (item.error.type && renderErrorMessages !== null && renderErrorMessages !== void 0 && renderErrorMessages[item.error.type]) {
      var _renderErrorMessages$;
      alertConfig = (_renderErrorMessages$ = renderErrorMessages[item.error.type]) === null || _renderErrorMessages$ === void 0 ? void 0 : _renderErrorMessages$.config;
    }
    return _objectSpread({
      message: message
    }, alertConfig);
  }, [renderErrorMessages, item.error]);
  if (RenderItem) return /*#__PURE__*/_jsx(RenderItem, _objectSpread({}, props), item.id);
  return /*#__PURE__*/_jsx(ChatItem, {
    actions: /*#__PURE__*/_jsx(Actions, {
      data: item
    }),
    avatar: item.meta,
    avatarAddon: groupNav,
    editing: editing,
    error: error,
    errorMessage: /*#__PURE__*/_jsx(ErrorMessage, {
      data: item
    }),
    loading: loading,
    message: item.content,
    messageExtra: /*#__PURE__*/_jsx(MessageExtra, {
      data: item
    }),
    onAvatarClick: onAvatarsClick === null || onAvatarsClick === void 0 ? void 0 : onAvatarsClick(item.role),
    onChange: function onChange(value) {
      return onMessageChange === null || onMessageChange === void 0 ? void 0 : onMessageChange(item.id, value);
    },
    onDoubleClick: function onDoubleClick(e) {
      if (item.id === 'default' || item.error) return;
      if (item.role && ['assistant', 'user'].includes(item.role) && e.altKey) {
        setEditing(true);
      }
    },
    onEditingChange: setEditing,
    placement: type === 'chat' ? item.role === 'user' ? 'right' : 'left' : 'left',
    primary: item.role === 'user',
    renderMessage: function renderMessage(editableContent) {
      return /*#__PURE__*/_jsx(RenderMessage, {
        data: item,
        editableContent: editableContent
      });
    },
    showTitle: showTitle,
    text: text,
    time: item.updateAt || item.createAt,
    type: type === 'chat' ? 'block' : 'pure'
  });
});
export default Item;