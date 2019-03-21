import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';

const main = {
  input: 'src/index.js',
  output: {
    name: 'tgcharts',
    file: 'dist/bundle.js',
    format: 'iife'
  },
  plugins: [
    minify(),
    commonjs({
      include: [ "node_modules/**" ], // Default: undefined
      ignoreGlobal: false, // Default: false
      sourceMap: true // Default: true
    }),
    nodeResolve({
      jsnext: true,
      main: false
    })
  ]
}

export default [main];
