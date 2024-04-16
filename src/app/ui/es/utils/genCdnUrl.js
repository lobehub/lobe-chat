import urlJoin from 'url-join';
var UNPKG_API = 'https://unpkg.com';
var ALIYUN_API = 'https://registry.npmmirror.com';
export var genCdnUrl = function genCdnUrl(_ref) {
  var pkg = _ref.pkg,
    _ref$version = _ref.version,
    version = _ref$version === void 0 ? 'latest' : _ref$version,
    path = _ref.path,
    proxy = _ref.proxy;
  switch (proxy) {
    case 'unpkg':
      {
        return urlJoin(UNPKG_API, "".concat(pkg, "@").concat(version), path);
      }
    default:
      {
        return urlJoin(ALIYUN_API, pkg, version, 'files', path);
      }
  }
};