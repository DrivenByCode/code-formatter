const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '.'), // 루트 디렉토리에 직접 출력
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        format: {
          comments: false,
        },
      },
      extractComments: false,
    })],
    // splitChunks 옵션 제거
  },
  externals: {
    obsidian: 'commonjs2 obsidian'
  },
  performance: {
    hints: false,
  }
};