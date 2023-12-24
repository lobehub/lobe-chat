import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    // ...
  ],
  rules: [
    [
      /^col-gap-(.+)$/,
      //@ts-ignore
      ([, d]) => {
        return {
          'column-gap': `${d}`,
        };
      },
    ],
    [
      /^row-gap-(.+)$/,
      ([, d]) => {
        return {
          'row-gap': `${d}`,
        };
      },
    ],
    // ['k1', { background: 'red' }], //静态规则
  ],
});
