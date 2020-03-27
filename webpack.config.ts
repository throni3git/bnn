import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as WorkboxPlugin from "workbox-webpack-plugin";
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
		new CleanWebpackPlugin({}),
		new HtmlWebpackPlugin({
			title: "Beatronome",
			favicon: "assets/images/favicon16.png"
		}),
		new CopyWebpackPlugin([
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
