import * as webpack from "webpack";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import 'webpack-dev-server';

const timestamp = JSON.stringify(new Date().toISOString());

const config: webpack.Configuration = {
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
	devtool: "source-map",
	devServer: {
		port: 3000,
	},
};

module.exports = config;
