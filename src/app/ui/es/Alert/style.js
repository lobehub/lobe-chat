import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9, _templateObject10, _templateObject11, _templateObject12, _templateObject13;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var cx = _ref.cx,
    token = _ref.token,
    css = _ref.css,
    prefixCls = _ref.prefixCls;
  var closable = _ref2.closable,
    hasTitle = _ref2.hasTitle,
    showIcon = _ref2.showIcon;
  var baseBlockPadding = hasTitle ? 16 : 8;
  var baseInlinePadding = hasTitle ? 16 : 12;
  return {
    banner: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        border: none;\n        border-radius: 0;\n      "]))),
    colorfulText: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        .", "-alert-message,.", "-alert-description {\n          color: inherit;\n        }\n      "])), prefixCls, prefixCls),
    container: cx(css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n          position: relative;\n\n          display: flex;\n          flex-direction: row;\n          gap: ", "px;\n          align-items: flex-start;\n\n          max-width: 100%;\n          padding-block: ", "px;\n          padding-inline: ", "px\n            ", "px;\n\n          .", "-alert-message {\n            font-weight: ", ";\n            line-height: 24px;\n            word-break: break-all;\n          }\n          .", "-alert-icon {\n            display: flex;\n            align-items: center;\n            height: 24px;\n            margin: 0;\n          }\n          .", "-alert-close-icon {\n            display: flex;\n            align-items: center;\n            height: 24px;\n            margin: 0;\n          }\n        "])), hasTitle ? 12 : 8, baseBlockPadding, showIcon ? baseInlinePadding : baseInlinePadding * 1.5, closable ? baseInlinePadding : baseInlinePadding * 1.5, prefixCls, hasTitle ? 600 : 400, prefixCls, prefixCls), hasTitle && css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n            .", "-alert-description {\n              line-height: 1.5;\n              word-break: break-all;\n              opacity: 0.75;\n            }\n          "])), prefixCls)),
    expandText: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n        &:hover {\n          cursor: pointer;\n        }\n      "]))),
    extra: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n        position: relative;\n\n        overflow: hidden;\n\n        max-width: 100%;\n\n        border: 1px solid;\n        border-block-start: none;\n        border-end-start-radius: ", "px;\n        border-end-end-radius: ", "px;\n      "])), token.borderRadiusLG, token.borderRadiusLG),
    extraBody: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n        overflow-x: auto;\n        width: 100%;\n        padding-block: ", "px;\n        padding-inline: ", "px;\n      "])), baseBlockPadding, baseInlinePadding),
    extraHeader: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n        padding-block: ", "px;\n        padding-inline: ", "px;\n        border-block-start: 1px dashed;\n      "])), baseBlockPadding * 0.75, baseInlinePadding * 0.75),
    hasExtra: css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n        border-block-end: none;\n        border-end-start-radius: 0;\n        border-end-end-radius: 0;\n      "]))),
    variantBlock: css(_templateObject10 || (_templateObject10 = _taggedTemplateLiteral(["\n        border: none;\n      "]))),
    variantGhost: css(_templateObject11 || (_templateObject11 = _taggedTemplateLiteral(["\n        background: transparent !important;\n      "]))),
    variantPure: css(_templateObject12 || (_templateObject12 = _taggedTemplateLiteral(["\n        padding: 0 !important;\n        background: transparent !important;\n        border: none;\n      "]))),
    variantPureExtraHeader: css(_templateObject13 || (_templateObject13 = _taggedTemplateLiteral(["\n        margin-block-start: ", "px;\n        margin-inline-start: ", "px;\n        padding-inline: 0;\n      "])), baseBlockPadding, -baseInlinePadding * 0.25)
  };
});