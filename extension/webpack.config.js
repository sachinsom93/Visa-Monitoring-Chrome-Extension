const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	entry: {
		main: path.join(__dirname, 'src', 'index.js'),
		background: path.join(__dirname, 'src', 'service-workers', 'background.js'),
		content: path.join(__dirname, 'src', 'content-scripts', 'content.js'),
	},
	devtool: 'cheap-module-source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'static/js/[name].js',
		clean: true,
		publicPath: '/',
	},
	target: 'web',
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.scss'],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|ts|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader'],
			},
			{
				test: /\.s[a|c]ss$/i,
				use: [
					{ loader: 'style-loader' }, //? Create style nodes from commonJS styles
					{
						loader: 'css-loader',
						options: {
							sourceMap: false,
						},
					}, //? Translate css to commonJS
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [['autoprefixer']],
							},
						},
					}, //? AutoPrefix imports
					{
						loader: 'sass-loader',
						options: {
							implementation: require('sass'),
							sourceMap: false,
						},
					}, //? Compile Sass or Scss to css
				],
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'React Web',
			filename: 'index.html',
			template: path.join(__dirname, 'public', 'index.html'),
		}),
		new MiniCssExtractPlugin({
			filename: 'static/css/[name].css',
			chunkFilename: 'static/css/chunks/[id].css',
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(__dirname, 'public', 'manifest.json'),
				},
				{
					from: path.join(__dirname, 'public', 'favicon.ico')
				},
				{
					from: path.join(__dirname, 'public', 'logo192.png')
				},
				{
					from: path.join(__dirname, 'public', 'logo512.png')
				}
			],
		}),
	],
	optimization: {
		minimizer: [new CssMinimizerPlugin()],
	},
};
