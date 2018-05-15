const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
  context: __dirname,
  devtool: "source-map",
  entry: [
    "./src/js/nuggetClient.js",
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        }
      },
    ]
  },
  output: {
    path: __dirname + "/dist/",
    filename: "js/nuggetClient.min.js"
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: "src/index.html", to: "index.html"},
      {from: "src/images/", to: "images/"},
      {from: "src/css/", to: "css/"},
    ]),
  ]
}
