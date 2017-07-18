import * as path from 'path';
import * as webpack from 'webpack';
import { transform } from './transform';

const config: webpack.Configuration = {
	devServer: {
		contentBase: path.resolve(__dirname, '..', 'public'),
		hot: true,
		publicPath: '/dist',
		stats: {
			colors: true,
		},
	},
	devtool: 'source-map',
	entry: {
		bundle: [path.resolve(__dirname, '..', 'src', 'app')],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{
						loader: 'ts-loader',
						options: {
							configFileName: path.resolve(__dirname, '..', 'tsconfig.json'),
							getCustomTransformers: () => ({
								after: [
								],
								before: [
									transform,
								],
							}),
						},
					},
				],
			},
		],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, '..', 'dist'),
		publicPath: '/dist/',
	},
	performance: {
		hints: false,
	},
	plugins: [
		new webpack.optimize.OccurrenceOrderPlugin(true),
		new webpack.NamedModulesPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV == null ? 'development' : process.env.NODE_ENV),
			},
		}),
		new webpack.DllReferencePlugin({
			context: '.',
			manifest: require('../dist/vendor-manifest.json'),
		}),
	],
	resolve: {
		alias: {
			generated: path.resolve(__dirname, '..', 'generated'),
		},
		extensions: ['.ts', '.tsx', '.js'],
		mainFields: ['module', 'main'],
	},
};

export default config;
