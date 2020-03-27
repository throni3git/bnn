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
			template: "src/index.html",
			favicon: "assets/images/favicon16.png"
		}),
		new CopyWebpackPlugin([
			{
				from: "assets/**/*",
				to: "./"
			},
			"src/manifest.webmanifest"
		])
	],
	output: {
		filename: "bundle.[hash].js",
		path: path.resolve("dist")
	},
	devtool: "source-map",
	devServer: {
		port: 3000
	} as webpackDevServer.Configuration
};

module.exports = config;
