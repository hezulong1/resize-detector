import path from 'path';
import ts from 'rollup-plugin-typescript2';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

function serve() {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require('child_process').spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        }
      );

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    }
  };
}

const tsPlugin = ts({
  check: process.env.NODE_ENV === 'production',
  tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  tsconfigOverride: {
    compilerOptions: {},
    exclude: ['__tests__']
  }
});

export default {
  input: './src/main.ts',
  output: {
    file: `./index.js`,
    name: 'Scrollbar',
    format: 'umd',
    sourcemap: false
  },
  plugins: [
    tsPlugin,
    !production && serve(),
    !production && livereload('website')
  ]
};
