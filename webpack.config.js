const path = require('path');
const fs = require('fs');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env','react'],
            plugins: ['transform-runtime','transform-react-jsx']
          }
        }
      }
    ]
  }
};
