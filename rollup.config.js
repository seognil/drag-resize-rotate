import babel from 'rollup-plugin-babel';
import del from 'del';
import { terser } from 'rollup-plugin-terser';

del.sync(['./dist']);

// * ----------------

const entry = './src/index.js';
const dist = './dist';

const output = {
    file: `${dist}/index.js`,
    format: 'cjs',
    sourcemap: true,
};
const plugins = [
    babel({
        // * only transpile our source code
        exclude: 'node_modules/**',
    }),
];

// * ----------------

const config = [
    {
        input: entry,
        output,
        plugins,
    },
    {
        input: entry,
        output: { ...output, file: `${dist}/index.min.js` },
        plugins: [...plugins, terser()],
    },
];

export default config;
