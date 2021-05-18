import path from 'path';
import minimist from 'minimist';
import ts from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';

const argv = minimist(process.argv.slice(2));

const tsPluginConfig = {
  check: process.env.NODE_ENV === 'production',
  tsconfig: path.resolve(__dirname, 'tsconfig.json')
};
const tsPlugin = ts(tsPluginConfig);
const postcssPlugin = postcss({ inject: false, minimize: true });

const buildFormats = [];
if (!argv.format || argv.format === 'es') {
  buildFormats.push({
    input: './src/resize-detector.ts',
    output: {
      file: './dist/resize-detector.esm.js',
      format: 'esm',
      sourcemap: false
    },
    plugins: [
      postcssPlugin,
      ts({
        ...tsPluginConfig,
        useTsconfigDeclarationDir: false,
        tsconfigOverride: {
          compilerOptions: {
            target: 'ES2015',
            declarationDir: 'typings'
          }
        }
      })
    ]
  });
}

if (!argv.format || argv.format === 'umd') {
  const unpkgConfig = [
    {
      input: './src/resize-detector.ts',
      output: {
        file: './dist/resize-detector.js',
        format: 'umd',
        name: 'ResizeDetector',
        sourcemap: false
      },
      plugins: [postcssPlugin, tsPlugin]
    },
    {
      input: './src/resize-detector.ts',
      output: {
        file: './dist/resize-detector.min.js',
        format: 'umd',
        name: 'ResizeDetector',
        sourcemap: false
      },
      plugins: [postcssPlugin, tsPlugin, terser()]
    }
  ];
  buildFormats.push(...unpkgConfig);
}

buildFormats.push({
  input: './src/resize-detector.ts',
  output: {
    file: './docs/resize-detector.js',
    format: 'umd',
    name: 'ResizeDetector',
    sourcemap: false
  },
  plugins: [
    postcssPlugin,
    ts({
      ...tsPluginConfig,
      tsconfigOverride: {
        compilerOptions: {
          declaration: false
        }
      }
    })
  ]
});

export default buildFormats;
