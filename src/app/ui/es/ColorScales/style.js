import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4;
import { createStyles } from 'antd-style';
export var alphaBg = {
  dark: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACPTkDJAAAAZUlEQVRIDe2VMQoAMAgDa9/g/1/oIzrpZBCh2dLFkkoDF0Fz99OdiOjks+2/7S8fRRmMMIVoRGSoYzvvqF8ZIMKlC1GhQBc6IkPzq32QmdAzkEGihpWOSPsAss8HegYySNSw0hE9WQ4StafZFqkAAAAASUVORK5CYII=) 0% 0% / 26px',
  light: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABGdBTUEAALGPC/xhBQAAAFpJREFUWAntljEKADAIA23p6v//qQ+wfUEcCu1yriEgp0FHRJSJcnehmmWm1Dv/lO4HIg1AAAKjTqm03ea88zMCCEDgO4HV5bS757f+7wRoAAIQ4B9gByAAgQ3pfiDmXmAeEwAAAABJRU5ErkJggg==) 0% 0% / 26px'
};
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    scaleBox: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    cursor: pointer;\n\n    position: relative;\n\n    width: 48px;\n    height: 32px;\n\n    background-position:\n      0 0,\n      0 8px,\n      8px -8px,\n      -8px 0;\n    background-size: 16px 16px;\n\n    transition: scale 400ms ", ";\n\n    &:active {\n      scale: 0.8;\n    }\n  "])), token.motionEaseOut),
    scaleItem: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    width: 100%;\n    height: 100%;\n  "]))),
    scaleRowTitle: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    width: 64px;\n    height: 32px;\n  "]))),
    text: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    opacity: 0.5;\n  "])))
  };
});