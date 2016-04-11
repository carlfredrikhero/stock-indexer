var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

nodeModules['webpage'] = 'commonjs webpage';

module.exports = {
  entry: './src/crawler.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'crawler.js'
  },
  externals: nodeModules,
  node: {
    __dirname: true
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  // plugins: [
  //   new webpack.BannerPlugin('require("source-map-support").install();',
  //                            { raw: true, entryOnly: false })
  // ],
  // devtool: 'cheap-sourcemap'
}
