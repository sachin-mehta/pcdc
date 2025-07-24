module.exports = {
  resolve: {
    fallback: {
      "path": require.resolve("path-browserify"),
      "fs": false,
      "crypto": false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ['@babel/plugin-transform-runtime', { regenerator: true }]
            ]
          }
        }
      }
    ]
  },
  devtool: 'source-map',
  output: {
    devtoolModuleFilenameTemplate: '[resource-path]'
  }
}; 