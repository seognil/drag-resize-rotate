import { terser } from 'rollup-plugin-terser';

const config = {
    input: './src/index.js',
    output: [
        {
            file: './dist/index.cjs.js',
            format: 'cjs',
        },
        {
            file: './dist/index.esm.js',
            format: 'esm',
        },
    ],
    plugins: [terser()],
};

export default config;
