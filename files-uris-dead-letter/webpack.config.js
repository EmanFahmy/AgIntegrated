const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: ["./index.js"],
  target: "node",
  mode: "development",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "index.js",
    libraryTarget: "commonjs"
  },
  externals: {
    "aws-sdk": "aws-sdk"
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: "node_modules/couchbase/build/Release/couchbase_impl.node",
        //from: "native-modules/linux/couchbase_impl.node",
        to: "build/Release/couchbase_impl.node"
      },
      { from: "package.json", to: "package.json" }
    ])
  ]
};
