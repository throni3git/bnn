import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as htmlPlugin from "html-webpack-plugin";
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
		new htmlPlugin({ title: "Beatronome" })
	],
	output: {
		path: path.resolve("dist")
	},
	devtool: "source-map",
	devServer: {
		port: 8001
	} as webpackDevServer.Configuration
};

module.exports = config;
