import path from 'path';
import ts from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import {
  terser
} from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const tsPlugin = ts({
  check: process.env.NODE_ENV === 'production',
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  tsconfigOverride: {
    compilerOptions: {},
    exclude: ['__tests__']
  }
});

export default {
  input: './src/resize-detector.ts',
  output: {
    file: `./resize-detector.js`,
    name: 'ResizeDetector',
    format: 'umd',
    sourcemap: false
  },
  plugins: [
    tsPlugin,
    postcss({ inject: false }),
    // production && terser()
  ]
};