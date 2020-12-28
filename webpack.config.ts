import * as webpack from "webpack";
import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import * as WorkboxPlugin from "workbox-webpack-plugin";
import * as path from "path";

// from https://gist.github.com/iperelivskiy/4110988#gistcomment-2697447
function funhash(s: string): number {
	for (var i = 0, h = 0xdeadbeef; i < s.length; i++)
		h = Math.imul(h ^ s.charCodeAt(i), 2654435761);
	return (h ^ (h >>> 16)) >>> 0;
}

const timestamp = JSON.stringify(new Date().toISOString());
const filenameManifest =
	"manifest." + funhash(timestamp).toString(16) + ".webmanifest";

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
			IS_PRODUCTION: true,
		}),
		new CleanWebpackPlugin({}),
		new HtmlWebpackPlugin({
			title: "Beatronome",
			template: "src/index.html",
			favicon: "assets/images/favicon16.png",
			templateParameters: { filenameManifest },
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "assets/**/*",
					to: "./",
				},
				{ from: "src/manifest.webmanifest", to: filenameManifest },
			],
		}),
		new WorkboxPlugin.GenerateSW({
			// these options encourage the ServiceWorkers to get in there fast
			// and not allow any straggling "old" SWs to hang around
			clientsClaim: true,
			skipWaiting: true,
		}),
	],
	output: {
		filename: "bundle.[contenthash].js",
		path: path.resolve("dist"),
	},
};

module.exports = config;
