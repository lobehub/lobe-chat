module.exports = {
  plugins: ['@babel/plugin-transform-class-static-block', 'react-native-reanimated/plugin'],
  presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
};
