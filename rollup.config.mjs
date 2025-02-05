import typescript from '@rollup/plugin-typescript';
import { importAsString } from 'rollup-plugin-string-import';
import pkg from './package.json' assert { type: 'json' };

export default {
  // prettier-ignore
  input: [
    'src/index.ts',
    'src/loading2/decoder.worker.js',
    'src/loading2/gltf-decoder.worker.js',
    'src/workers/binary-decoder.worker.js',
  ],
  output: {
    dir: 'dist',
    sourcemap: true,
  },
  // prettier-ignore
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  watch: {
    clearScreen: false,
    include: 'src/**',
    exclude: 'node_modules/**',
  },
  plugins: [
    importAsString({
      include: ['**/*.(vert|frag)'],
    }),
    typescript(),
  ],
};
