import { GraphQLEnumType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from 'graphql';
import { getInputObjectTypes } from 'graphql-fragment-type-generator/lib/InputObjectTypePrinter';
import { getTypeBrands } from 'graphql-fragment-type-generator/lib/TypeBrandCreator';

export function generateSchemaFile(schema: GraphQLSchema) {
	const brands = getTypeBrands(schema);
	const inputObjectTypes = getInputObjectTypes(schema);
	const typeMap = schema.getTypeMap();
	const extraBrands = [];
	const interfacesMap: { [interfaceName: string]: string[] } = {};
	const objects: string[] = [];
	const unions: string[] = [];
	const enums: string[] = [];

	function addToInterface(interfaceName: string, objectName: string) {
		if (interfacesMap[interfaceName] == null) {
			interfacesMap[interfaceName] = [];
		}
		interfacesMap[interfaceName].push(objectName);
	}

	const queryType = schema.getQueryType();
	typeMap[queryType.name] = queryType;
	extraBrands.push('export enum ' + queryType.name + ' {};');

	const mutationType = schema.getMutationType();
	if (mutationType != null) {
		typeMap[mutationType.name] = mutationType;
		extraBrands.push('export enum ' + mutationType.name + ' {};');
	}

	const subscriptionType = schema.getSubscriptionType();
	if (subscriptionType != null) {
		typeMap[subscriptionType.name] = subscriptionType;
		extraBrands.push('export enum ' + subscriptionType.name + ' {};');
	}

	// tslint:disable-next-line:forin
	for (const i in typeMap) {
		const typeInfo = typeMap[i];
		if (typeInfo.name.length >= 2 && typeInfo.name[0] === '_' && typeInfo.name[1] === '_') {
			continue;
		}
		// Can't use instanceof, we don't have the ability to require graphql
		if (typeInfo instanceof GraphQLObjectType) {
			const typeInterfaces = typeInfo.getInterfaces();
			for (const interfaceType of typeInterfaces) {
				addToInterface(interfaceType.name, typeInfo.name);
			}
		}
	}

	function generateInterfacePredicates(interfaceName: string, objectTypeNames: string[]) {
		const names = objectTypeNames.map((n) => JSON.stringify(n));
		return 'export type ' + interfaceName + 'TypeNames = ' + names.join(' | ') + ';\n';
	}

	const interfaces = [];

	// tslint:disable-next-line:forin
	for (const interfaceName in interfacesMap) {
		interfaces.push(generateInterfacePredicates(interfaceName, interfacesMap[interfaceName]));
	}

	return (
		'// tslint:disable\n' +
		brands + '\n' +
		extraBrands.join('\n') + '\n\n' +
		inputObjectTypes + '\n\n' +
		unions.sort().join('\n') + '\n\n' +
		interfaces.sort().join('\n') + '\n\n' +
		objects.sort().join('\n') + '\n\n' +
		enums.sort().join('\n') +
		'\n'
	);
}
