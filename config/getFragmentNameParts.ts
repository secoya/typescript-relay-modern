const DEFAULT_PROP_NAME = 'data';
export function getFragmentNameParts(fragmentName: string): [string, string] {
	const match = fragmentName.match(
		/^([a-zA-Z][a-zA-Z0-9]*)(?:_([a-zA-Z][_a-zA-Z0-9]*))?$/,
	);
	if (!match) {
		throw new Error(
			'BabelPluginGraphQL: Fragments should be named ' +
			'`ModuleName_fragmentName`, got `' +
			fragmentName +
			'`.',
		);
	}
	const moduleName = match[1];
	const propName = match[2];
	if (propName === DEFAULT_PROP_NAME) {
		throw new Error(
			'TypescriptTransformerRelay: Fragment `' +
			fragmentName +
			'` should not end in ' +
			'`_data` to avoid conflict with a fragment named `' +
			moduleName +
			'` ' +
			'which also provides resulting data via the React prop `data`. Either ' +
			'rename this fragment to `' +
			moduleName +
			'` or choose a different ' +
			'prop name.',
		);
	}
	return [moduleName, propName || DEFAULT_PROP_NAME];
}
