const path = require('path');

module.exports = {
  entry: './example/index.js',
  devtool: 'inline-source-map',
  mode: 'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module:{
      rules:[{
          loader: 'babel-loader',
          test: /\.js$|jsx/,
          exclude: /node_modules/
      },{
        test: /\.(png|fbx)/,
        type: 'asset/resource',
      }
    ]
  },
};