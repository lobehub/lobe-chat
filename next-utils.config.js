const pc = require('picocolors');

const nextUtilsConfig = () => {
  const trueEnv = ['true', '1', 'yes'];
  const esmExternals = trueEnv.includes(process.env?.NEXTJS_ESM_EXTERNALS ?? 'false');
  const tsconfigPath = process.env.NEXTJS_TSCONFIG_PATH
    ? process.env.NEXTJS_TSCONFIG_PATH
    : './tsconfig.json';

  // eslint-disable-next-line no-console
  console.warn(
    `${pc.green('warn  -')} experimental.esmExternals is ${esmExternals ? 'enabled' : 'disabled'}`,
  );
  return {
    esmExternals,
    tsconfigPath,
  };
};

module.exports = {
  loadCustomBuildParams: nextUtilsConfig,
};
