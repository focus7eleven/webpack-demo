const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const merge = require('webpack-merge');

// validate the configuration against a schema and warn if we are tyring to do somting not sensible
const validate = require('webpack-validator');

const parts = require('./libs/parts');

const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

const common = {
  // "entry" tells webpack to traverse dependencies starting from the app entry directory and then to output the resulting bundle below our build derectory using the entry name and .js extension
  // vendor entry is done by matching the dependency name.
  entry: {
    app: PATHS.app,
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Webpack demo'
    })
  ]
};

var config;

switch(process.env.npm_lifecycle_event){
  case 'build':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path:PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        }

      },
      parts.minify(),
      parts.setFreeVariable(
        'process.env.NODE_ENV',
        'production'
      ),
      parts.extractBundle({
        name: 'vendor',
        entries: ['react']
      }),
      parts.setupCSS(PATHS.app)
    );
    break;
  default:
    config = merge(
      common,
      {
        // inline sourcemaps included within bundles
        devtool: 'eval-source-map'
      },
      parts.setupCSS(PATHS.app),
      parts.devServer({
        // Customize host and port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    )
}

module.exports = validate(config);
