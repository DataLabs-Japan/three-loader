import { readFileSync } from 'node:fs';
import typescript from '@rollup/plugin-typescript';
import { importAsString } from 'rollup-plugin-string-import';

// Read rather than import: the `assert { type: 'json' }` attribute this used is a syntax error on
// current Node, and `with` would in turn be one on older Node. Reading the file works on both.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

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
