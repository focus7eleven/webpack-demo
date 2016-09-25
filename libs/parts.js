const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack-plugin');

exports.purifyCSS = function(paths) {
  return {
    plugins: [
      new PurifyCSSPlugin({
        basePath: process.cwd(),
        // `paths` is used to point PurifyCSS to files not
        // visible to Webpack. You can pass glob patterns to it.
        paths: paths
      }),
    ]
  }
};

// Won't work with HMR, using it only for production
exports.extractCSS = function(paths) {
  return {
    module: {
      loaders: [
        // Extract CSS during build
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style','css'),
          include: paths
        }
      ]
    },
    plugins: [
      // Output extracted CSS to a file
      new ExtractTextPlugin('[name].[chunkhash].css')
    ]
  };
};

exports.clean = function(path) {
  return {
    plugins: [
      new CleanWebpackPlugin([path], {
        // Without `root` CleanWebpackPlugin won't point to our project and will fail to work
        root: process.cwd()
      })
    ]
  }
};

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

// Replaced by extractCSS only for production
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
