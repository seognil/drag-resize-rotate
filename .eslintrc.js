module.exports = {
    parser: 'babel-eslint',
    extends: ['airbnb', 'prettier', 'eslint:recommended'],
    plugins: ['mocha', 'jest'],

    // * simple global way
    env: {
        es6: true,
        // browser: true,
    },

    // * for different codes
    overrides: [
        {
            files: ['src/**/*.js'],
            env: { browser: true, node: true },
        },
        {
            files: ['test/**/*.js'],
            env: { jest: true, mocha: true },
        },
    ],

    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
    },
    rules: {
        'no-console': ['warn'],
    },
};
