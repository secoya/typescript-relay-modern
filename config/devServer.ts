#!../node_modules/.bin/ts-node
import * as express from 'express';
import * as graphQLHTTP from 'express-graphql';
import * as ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';
import * as DashboardPlugin from 'webpack-dashboard/plugin';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import { schema } from '../data/schema';
import { transform } from './transform';
import config from './webpack.config';

const devConfig = {
	...config,
	entry: {
		...config.entry as object,
		bundle: [
			'webpack-hot-middleware/client',
			'react-hot-loader/patch',
			...(config.entry as { bundle: string[] }).bundle,
		],
	},
	module: {
		...config.module,
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					'react-hot-loader/webpack',
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
							transpileOnly: true,
						},
					},
				],
			},
		],
	},
	plugins: [
		new ForkTSCheckerPlugin({
			tsconfig: path.resolve(__dirname, '..', 'tsconfig.json'),
		}),
		new webpack.HotModuleReplacementPlugin(),
		...config.plugins || [],
		new DashboardPlugin(),
	],
};

const compiler = webpack(devConfig);
const hotMiddleware = webpackHotMiddleware(compiler, {
	path: '/__webpack_hmr',
});
const devMiddleware = webpackDevMiddleware(compiler, {
	noInfo: true,
	publicPath: '/dist/',
});

const app = express();

app.get('/*', (req, res, next) => {
	if (req.url.startsWith('/dist')) {
		return devMiddleware(req, res, next);
	} else if (req.url.startsWith('/__webpack_hmr')) {
		return hotMiddleware(req, res, next);
	}
	next();
});

app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.use('/graphql', graphQLHTTP({ schema: schema, pretty: true }));

app.listen(8080, () => {
	// tslint:disable-next-line:no-console
	console.log('Server running on http://localhost:8080/');
	// tslint:disable-next-line:no-console
	console.log('GraphQL running on http://localhost:8080/graphql');
});
