declare namespace ForkTSCheckerPlugin {
	interface Config {
		tsconfig?: string;
		tslint?: string;
		async?: boolean;
	}
}
import * as webpack from 'webpack';

declare class ForkTSCheckerPlugin extends webpack.Plugin {
	constructor(config: ForkTSCheckerPlugin.Config);
}

export as namespace ForkTSCheckerPlugin;
export = ForkTSCheckerPlugin;
