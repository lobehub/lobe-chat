import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12, _templateObject13, _templateObject14, _templateObject15, _templateObject16, _templateObject17, _templateObject18;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode,
    responsive = _ref.responsive;
  var placement = _ref2.placement,
    type = _ref2.type,
    title = _ref2.title,
    primary = _ref2.primary,
    avatarSize = _ref2.avatarSize,
    editing = _ref2.editing,
    time = _ref2.time;
  var blockStylish = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding-block: 8px;\n      padding-inline: 12px;\n\n      background-color: ", ";\n      border-radius: ", "px;\n\n      transition: background-color 100ms ", ";\n    "])), primary ? isDarkMode ? token.colorFill : token.colorBgElevated : isDarkMode ? token.colorFillSecondary : token.colorBgContainer, token.borderRadiusLG, token.motionEaseOut);
  var pureStylish = css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      padding-block-start: ", ";\n    "])), title ? 0 : '6px');
  var pureContainerStylish = css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      margin-block-end: -16px;\n      transition: background-color 100ms ", ";\n    "])), token.motionEaseOut);
  var typeStylish = type === 'block' ? blockStylish : pureStylish;
  var editingStylish = editing && css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n        width: 100%;\n      "])));
  return {
    actions: cx(css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          flex: none;\n          align-self: ", ";\n          justify-content: ", ";\n        "])), type === 'block' ? 'flex-end' : placement === 'left' ? 'flex-start' : 'flex-end', placement === 'left' ? 'flex-end' : 'flex-start'), editing && css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n            pointer-events: none !important;\n            opacity: 0 !important;\n          "])))),
    avatarContainer: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n        position: relative;\n        flex: none;\n        width: ", "px;\n        height: ", "px;\n      "])), avatarSize, avatarSize),
    avatarGroupContainer: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n        width: ", "px;\n      "])), avatarSize),
    container: cx(type === 'pure' && pureContainerStylish, css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n          position: relative;\n          width: 100%;\n          max-width: 100vw;\n          padding: 16px;\n\n          time {\n            display: inline-block;\n            white-space: nowrap;\n          }\n\n          div[role='menubar'] {\n            display: flex;\n          }\n\n          time,\n          div[role='menubar'] {\n            pointer-events: none;\n            opacity: 0;\n            transition: opacity 200ms ", ";\n          }\n\n          &:hover {\n            time,\n            div[role='menubar'] {\n              pointer-events: unset;\n              opacity: 1;\n            }\n          }\n\n          ", " {\n            padding-block: 4px;\n            padding-inline: 8px;\n          }\n        "])), token.motionEaseOut, responsive.mobile)),
    editingContainer: cx(editingStylish, css(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["\n          padding-block: 8px 12px;\n          padding-inline: 12px;\n          border: 1px solid ", ";\n\n          &:active,\n          &:hover {\n            border-color: ", ";\n          }\n        "])), token.colorBorderSecondary, token.colorBorder), type === 'pure' && css(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["\n            background: ", ";\n            border-radius: ", "px;\n          "])), token.colorFillQuaternary, token.borderRadius)),
    editingInput: css(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n        width: 100%;\n      "]))),
    errorContainer: css(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["\n        position: relative;\n        overflow: hidden;\n        width: 100%;\n      "]))),
    loading: css(_templateObject14 || (_templateObject14 = _taggedTemplateLiteral(["\n        position: absolute;\n        inset-block-end: 0;\n        inset-inline: ", "\n          ", ";\n\n        width: 16px;\n        height: 16px;\n\n        color: ", ";\n\n        background: ", ";\n        border-radius: 50%;\n      "])), placement === 'right' ? '-4px' : 'unset', placement === 'left' ? '-4px' : 'unset', token.colorBgLayout, token.colorPrimary),
    message: cx(typeStylish, css(_templateObject15 || (_templateObject15 = _taggedTemplateLiteral(["\n          position: relative;\n\n          ", " {\n            width: 100%;\n          }\n        "])), responsive.mobile)),
    messageContainer: cx(editingStylish, css(_templateObject16 || (_templateObject16 = _taggedTemplateLiteral(["\n          position: relative;\n          overflow: hidden;\n          max-width: 100%;\n          margin-block-start: ", "px;\n\n          ", " {\n            overflow-x: auto;\n          }\n        "])), time ? -16 : 0, responsive.mobile)),
    messageContent: cx(editingStylish, css(_templateObject17 || (_templateObject17 = _taggedTemplateLiteral(["\n          position: relative;\n          overflow-x: hidden;\n          max-width: 100%;\n\n          ", " {\n            flex-direction: column !important;\n          }\n        "])), responsive.mobile)),
    messageExtra: cx('message-extra'),
    name: css(_templateObject18 || (_templateObject18 = _taggedTemplateLiteral(["\n        margin-block-end: 6px;\n\n        font-size: 12px;\n        line-height: 1;\n        color: ", ";\n        text-align: ", ";\n      "])), token.colorTextDescription, placement === 'left' ? 'left' : 'right')
  };
});