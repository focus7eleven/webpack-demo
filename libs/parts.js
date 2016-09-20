const webpack = require('webpack');

exports.extractBundle = function(options) {
  const entry = {};
  entry[options.name] = options.entries;

  return {
    // Define an entry point needed for splitting
    entry: entry,
    plugins: [
      // Extract bundle and manifest files. Manifest is needed for realiable caching.
      new webpack.optimize.CommonsChunkPlugin({
        names: [options.name,'manifest']
      })
    ]
  };
};

exports.setupCSS = function(paths){
  return{
    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: ['style', 'css'],
          // 如果不设置include参数，webpack会遍历根目录下的所有文件
          // 还有一个exclude参数，但大多数情况用include
          include: paths
        }
      ]
    }
  };
};

exports.minify = function() {
  return {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  };
};

// React relies on process.env.NODE_ENV based optimizations.
// If we force it to production, React will get built in an optimized manner.
// it will give you a smaller build and improved performance.
exports.setFreeVariable = function(key, value) {
  const env = {};
  env[key] = JSON.stringify(value);

  return {
    plugins: [
      new webpack.DefinePlugin(env)
    ]
  };
};

exports.devServer = function(options){
  return {
    devServer: {
      historyApiFallback: true,

      hot: true,

      inline: true,

      //Display only errors to reduce the amount of output
      stats: 'errors-only',

      host: options.host, // Defaults to `localhost`

      port: options.port //Defaults to 8080
    },
    plugins: [
      // Enable multi-pass compilation for enhanced performance
      // in larger projects. Good default.
      new webpack.HotModuleReplacementPlugin({
        multiStep: true
      })
    ]
  };
}
