const path = require('path');
const PluginUglifyjs = require('@wepy/plugin-uglifyjs');

var prod = process.env.NODE_ENV === 'production';

module.exports = {
  wpyExt: '.wpy',
  cliLogs: !prod,
  build: {
  },
  static: 'src/image',
  resolve: {
    alias: {
      counter: path.join(__dirname, 'src/components/counter'),
      '@': path.join(__dirname, 'src')
    },
    aliasFields: ['wepy', 'weapp'],
    modules: ['node_modules']
  },
  compilers: {
    less: {
      compress: prod
    },
    babel: {
      sourceMap: true,
      presets: [
        '@babel/preset-env'
      ],
      plugins: [
        '@wepy/babel-plugin-import-regenerator',
      ]
    }
  },
  plugins: [
    PluginUglifyjs({
      // options
    })
  ],
  appConfig: {
    noPromiseAPI: ['createSelectorQuery']
  }
}