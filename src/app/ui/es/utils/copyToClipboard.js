import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
export var copyToClipboard = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(text) {
    var textArea;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return navigator.clipboard.writeText(text);
        case 3:
          _context.next = 14;
          break;
        case 5:
          _context.prev = 5;
          _context.t0 = _context["catch"](0);
          textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.append(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        case 14:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 5]]);
  }));
  return function copyToClipboard(_x) {
    return _ref.apply(this, arguments);
  };
}();