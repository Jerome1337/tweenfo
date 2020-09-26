const cssnano = require('cssnano');
const postcssColorMod = require('postcss-color-mod-function');
const postcssPresetEnv = require('postcss-preset-env');
const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');
const purgeCss = require('@fullhuman/postcss-purgecss');
const tailwindCss = require('tailwindcss');

const production = process.env.NODE_ENV === 'production';

const purgecss = purgeCss({
  content: ['./src/**/*.svelte', './src/**/*.html'],
  defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});

module.exports = {
  plugins: [
    postcssImport(),
    postcssUrl(),
    tailwindCss(),
    postcssPresetEnv({
      stage: 0,
      autoprefixer: {
        grid: false,
      },
    }),
    postcssColorMod(),
    cssnano({
      autoprefixer: false,
      preset: ['default'],
    }),
    ...(production ? [purgecss] : []),
  ],
};
