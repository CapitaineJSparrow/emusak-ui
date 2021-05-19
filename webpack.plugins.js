const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src', 'assets'),
        to: path.resolve(__dirname, '.webpack/renderer', 'assets')
      },
    ],
    options: {
      concurrency: 100,
    },
  }),
  new webpack.DefinePlugin({
    'process.env.EMUSAK_URL': `'${process.env.EMUSAK_URL}'`,
    'process.env.EMUSAK_CDN': `'${process.env.EMUSAK_CDN}'`,
  })
];
