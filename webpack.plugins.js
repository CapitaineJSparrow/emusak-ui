const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env.EMUSAK_URL': `'${process.env.EMUSAK_URL}'`,
    'process.env.EMUSAK_CDN': `'${process.env.EMUSAK_CDN}'`,
  })
];
