module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          "~global-css":"./src/css",
          "~base": "./src/dist",
          '~webpack': './src/webpack',
          '~client': './src/',
          '~pages': './src/pages',
          '~constants': './src/constants',
          '~components': './src/components',
          '~modules': './src/modules',
          '~actions': './src/actions',
          '~reducers': './src/reducers',
          '~hocs': './src/hocs',
          '~helpers': './src/helpers',
          '~settings': './src/settings',
          '~translations': './src/resources/translations',
        },
      },
    ],
    "jsx-control-statements",
    "@babel/plugin-syntax-dynamic-import",
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties'],
  ],
}
