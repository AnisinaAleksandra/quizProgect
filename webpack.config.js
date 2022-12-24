const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app.js",
  mode: "development",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "templates", to: "templates" },
        { from: "styles", to: "styles" },
        { from: "static/fonts", to: "fonts" },
        { from: "static/images", to: "images" },
      ],
    }),
  ],
  devServer: {
    static: ".dist.js",
    compress: true,
    port: 9000,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
