const path = require("path");

module.exports = {
	entry: "./js/main.js",
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "bundle.js",
	},
	mode: "production",
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
			},
		],
	},
	plugins: [],
};
