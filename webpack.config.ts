import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as htmlPlugin from "html-webpack-plugin";
import * as copyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as path from "path";

const timestamp = JSON.stringify(new Date().toISOString());

const config = {
	entry: "./src/index.ts",
	resolve: {
		extensions: [".js", ".ts", ".tsx"]
	},
	module: {
		rules: [
			{
				test: /.tsx?$/,
				loader: "ts-loader"
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			BUILD_TIMESTAMP: timestamp
		}),
		new htmlPlugin({ title: "Beatronome" }),
		new CleanWebpackPlugin({}),
		new copyWebpackPlugin([
			{
				from: "assets/**/*",
				to: "./"
			}
		])
	],
	output: {
		path: path.resolve("dist")
	},
	devtool: "source-map",
	devServer: {
		port: 3000
	} as webpackDevServer.Configuration
};

module.exports = config;
