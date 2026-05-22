const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin"); // Optional for JS minification
const webpack = require("webpack");

module.exports = {
  mode: "development",

  entry: {
    main: "./assets/js/src/index.js",
    style: "./assets/scss/style.scss",
    emblem: { import: "./assets/js/src/three-js/emblem-pulse.js" },
  },

  output: {
    filename: "[name].[contenthash].js",
    path: path.resolve(__dirname, "assets/js/dist"),
    clean: true, // cleans old files on build
    publicPath: "", // adjust if your files load from a different path
  },

  devtool: "inline-source-map", // inline is great for dev, but external is better for prod

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"], // optional but recommended for ES6+
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "../images/[name][ext]"
        },
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      `...`, // extend default minimizers
      new CssMinimizerPlugin(),
      new TerserPlugin(), // minifies JS
    ],
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
     splitChunks: {
       cacheGroups: {
         vendor: {
           test: /[\\/]node_modules[\\/]/,
           name: 'vendors',
           chunks: 'all',
         },
       },
     },
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "../css/[name].[contenthash].css",
    }),
  ],

  stats: {
    errorDetails: true,
  },
};
