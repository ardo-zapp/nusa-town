const webpack = require('webpack');
const path = require('path');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
	context: path.join(__dirname, 'src'),
	output: {
		path: path.resolve(__dirname, 'build', 'assets', 'scripts'),
		filename: '[name].js',
		publicPath: '/assets/scripts/',
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['angular2-template-loader'],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [{ loader: 'raw-loader', options: { esModule: false } }],
			},
			{
				test: /\.html$/,
				use: [{ loader: 'raw-loader', options: { esModule: false } }],
			},
			{
				test: /\.pug$/,
				use: [
					{ loader: 'raw-loader', options: { esModule: false } },
					{
						loader: 'pug-html-loader',
						query: { doctype: 'html', plugins: require('pug-plugin-ng') },
					},
				],
			},
			{
				test: /\.scss$/,
				use: [
					{ loader: 'raw-loader', options: { esModule: false } },
					{
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							plugins: () => [
								autoprefixer({ overrideBrowserslist: ['last 2 versions'] }),
								cssnano({ preset: ['default', { discardComments: { removeAll: true } }] }),
							],
						},
					},
					{
						loader: 'sass-loader',
						options: {
							includePaths: ['src/styles'],
							silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'slash-div'],
							quietDeps: true
						},
					},
				],
			},
			{
				// Mark files inside `@angular/core` as using SystemJS style dynamic imports.
				// Removing this will cause deprecation warnings to appear.
				test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
				parser: { system: true }, // enable SystemJS
			},
		],
	},
	plugins: [
		new webpack.ContextReplacementPlugin(
			/@angular([\\/])core/,
			path.resolve(__dirname, 'src', 'ts'),
			{}
		),
	],
};
