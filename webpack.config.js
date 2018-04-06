const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = {
  entry: {
    front: './src/front/index.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist'
  },
  module:{
    rules: [{
      test: /(\.js|\.jsx)$/,
      exclude: /node_modules/,
      use: ['babel-loader'],
    },
    {
      test: /(\.css|\.scss|\.sass)$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'sass-loader',
      }],
    }],
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
       template: 'src/front/index.html'
    })
  ]
};

module.exports = config;
