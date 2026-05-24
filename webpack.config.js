const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",

  entry: {
    emblem: "./assets/js/ani/index.js",
  },

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "assets/js/dist"),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },

  stats: {
    errorDetails: true,
  },
};
