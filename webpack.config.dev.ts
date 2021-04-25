import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as path from "path";

const timestamp = JSON.stringify(new Date().toISOString());

const config = {
	entry: "./src/index.ts",
	resolve: {
		extensions: [".js", ".ts", ".tsx"],
	},
	module: {
		rules: [
			{
				test: /.tsx?$/,
				loader: "ts-loader",
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			BUILD_TIMESTAMP: timestamp,
			IS_PRODUCTION: false,
		}),
		new CleanWebpackPlugin({}),
		new HtmlWebpackPlugin({
			title: "beatronome.one",
			favicon: "assets/icons/logo16.png",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "assets/**/*",
					to: "./",
				},
			],
		}),
	],
	output: {
		filename: "bundle.[contenthash].js",
		path: path.resolve("dist"),
	},
	devtool: "source-map",
	devServer: {
		port: 3000,
		stats: "errors-warnings",
	} as webpackDevServer.Configuration,
};

module.exports = config;
