import * as path from 'path';
import * as webpack from 'webpack';

const config: webpack.Configuration = {
	devtool: 'source-map',
	entry: {
		vendor: ['react', 'react-dom', 'react-relay', 'relay-runtime', 'classnames'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
			},
		],
	},
	node: {
		Buffer: false,
		__dirname: false,
		__filename: false,
		console: false,
		global: true,
		process: false,
		setImmediate: false,
	},
	output: {
		filename: '[name].bundle.js',
		library: '[name]_lib',
		path: path.resolve(__dirname, '..', 'public'),
	},
	plugins: [
		new webpack.optimize.AggressiveMergingPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(true),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(process.env.NODE_ENV == null ? 'development' : process.env.NODE_ENV),
			},
		}),
		new webpack.DllPlugin({
			name: '[name]_lib',
			path: path.resolve(__dirname, '..', 'dist', '[name]-manifest.json'),
		}),
	],
};

export default config;
