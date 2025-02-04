import typescript from '@rollup/plugin-typescript';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import { importAsString } from 'rollup-plugin-string-import';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
  },
  plugins: [
    importAsString({
      include: ['**/*.(vert|frag)'],
    }),
    webWorkerLoader({
      targetPlatform: 'browser',
      'web-worker': '*.worker.js',
    }),
    typescript(),
  ],
};
