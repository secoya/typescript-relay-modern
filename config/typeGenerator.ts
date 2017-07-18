import * as fs from 'async-file';
import {
	graphql,
	introspectionQuery,
	parseType,
	visit,
	ASTNode,
	BREAK,
	DirectiveNode,
	DocumentNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	GraphQLDirective,
	GraphQLObjectType,
	GraphQLSchema,
	ListTypeNode,
	NamedTypeNode,
	NameNode,
	OperationDefinitionNode,
	Source,
	TypeNode,
	ValueNode,
} from 'graphql';
import { getClientSchema } from 'graphql-fragment-type-generator';
import { extractNamedTypes } from 'graphql-fragment-type-generator/lib/ExtractNamedTypes';
import { mapFragmentType } from 'graphql-fragment-type-generator/lib/FragmentMapper';
import { mapType } from 'graphql-fragment-type-generator/lib/MultiFragmentMapper';
import { printType } from 'graphql-fragment-type-generator/lib/Printer';
import {
	decorateTypeWithTypeBrands,
	decorateWithTypeBrands,
	getTypeBrandNames,
} from 'graphql-fragment-type-generator/lib/TypeBrandDecorator';
import { normalizeListType, normalizeType } from 'graphql-fragment-type-generator/lib/TypeNormalizer';
import * as T from 'graphql-fragment-type-generator/lib/Types';
import * as path from 'path';
import * as ts from 'typescript';
import { getFragmentNameParts } from './getFragmentNameParts';
import { generateSchemaFile } from './schemaFileGenerator';

interface NamedBrandedTypeResult {
	brandsToImport: string[];
	exportNamesTypeScriptCode: string;
	fragmentTypeBrandText: string;
	fragmentTypeText: string;
}

interface BrandedTypeResult {
	brandsToImport: string[];
	fragmentTypeBrandText: string;
	fragmentTypeText: string;
}

function getTypeBrandedTypeDefinition(
	normalizedAst: T.FlattenedObjectType | T.FlattenedListType,
	withNames: boolean,
	indentSpaces?: number,
): BrandedTypeResult {
	const brandedAst = decorateTypeWithTypeBrands(normalizedAst) as T.FlattenedObjectType | T.FlattenedListType;

	const names = getTypeBrandNames(brandedAst);

	const brandsToImport = names.allRequiredNames;
	const fragmentTypeBrandText = getFragmentTypeBrandText(names.fragmentTypeNames, brandedAst.kind === 'List');

	const typeText = printType(false, brandedAst, withNames, indentSpaces);

	return {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: fragmentTypeBrandText,
		fragmentTypeText: typeText,
	};
}

function getNamedTypeBrandedTypeDefinitions(
	normalizedAst: T.FlattenedObjectType | T.FlattenedListType,
	indentSpaces?: number,
): NamedBrandedTypeResult {
	const res = getTypeBrandedTypeDefinition(normalizedAst, true, indentSpaces);
	const extractedNames = extractNamedTypes(normalizedAst);

	const tsChunks: string[] = [];

	extractedNames.forEach((typeAst, name) => {
		const decorated = decorateTypeWithTypeBrands(typeAst);

		const def = printType(false, decorated, true, 0);
		tsChunks.push(`export type ${name} = ${def};`);
	});

	return {
		...res,
		exportNamesTypeScriptCode: tsChunks.join('\n'),
	};
}

function getFragmentTypeBrandText(names: string[], plural: boolean, indentSpaces?: number): string {
	if (indentSpaces == null) {
		indentSpaces = 0;
	}
	if (plural) {
		return '(' + getFragmentTypeBrandText(names, false, indentSpaces) + ' | null)[]';
	}
	return `{
${' '.repeat(indentSpaces + 2)}'': ${names.join(' | ')};
${' '.repeat(indentSpaces)}}`;
}

function getNormalizedAst(
	schema: GraphQLSchema,
	documentNode: DocumentNode,
): T.FlattenedObjectType | T.FlattenedListType {
	const ast = mapFragmentType(schema, documentNode);
	if (ast.kind === 'Object') {
		return normalizeType(schema, ast);
	} else {
		return normalizeListType(schema, ast);
	}
}
function getNormalizedOperationAst(
	schema: GraphQLSchema,
	documentNode: DocumentNode,
	rootNode: OperationDefinitionNode,
): T.FlattenedObjectType {

	const ast = mapType(schema, documentNode, rootNode);
	return normalizeType(schema, ast);
}

function findReferencedFragmentNames(
	node: FragmentDefinitionNode,
	fragmentMap: Map<string, FragmentDefinitionNode>,
): Set<string> {
	const visitedFragments = new Set<string>();
	const fragmentsToVisit = [node];
	const allFragments = new Set<string>();

	while (fragmentsToVisit.length > 0) {
		const nodeToVisit = fragmentsToVisit[fragmentsToVisit.length - 1];
		fragmentsToVisit.pop();
		visitedFragments.add(nodeToVisit.name.value);
		visit(nodeToVisit, {
			FragmentSpread: (fragmentSpread: FragmentSpreadNode) => {
				allFragments.add(fragmentSpread.name.value);

				if (!visitedFragments.has(fragmentSpread.name.value)) {
					const fragment = fragmentMap.get(fragmentSpread.name.value);
					if (fragment == null) {
						throw new Error('Could not find fragment: ' + fragmentSpread.name.value);
					}
					fragmentsToVisit.push(fragment);
				}
			},
		});
	}

	return allFragments;
}

interface VariableInfo {
	hasDefaultValue: boolean;
	typeNode: TypeNode;
}

function getArgumentType(
	inputValue: ValueNode,
): VariableInfo | null {
	if (inputValue.kind !== 'ObjectValue') {
		return null;
	}

	const typeField = inputValue.fields.find(v => v.name.value === 'type');

	if (typeField == null || typeField.value.kind !== 'StringValue') {
		return null;
	}

	const typeString = typeField.value.value;
	const hasDefaultValue = inputValue.fields.find(v => v.name.value === 'defaultValue') != null;
	return {
		hasDefaultValue: hasDefaultValue,
		// Type definitions are not right for this version of graphql
		typeNode: (parseType as any as (source: string) => TypeNode)(typeString),
	};
}

function getVariableDefinitions(
	definition: FragmentDefinitionNode,
): Map<string, VariableInfo> | null {
	if (definition.directives == null) {
		return null;
	}

	const argumentsDefinition = definition.directives.find(v => v.name.value === 'argumentDefinitions');

	if (argumentsDefinition == null || argumentsDefinition.arguments == null) {
		return null;
	}

	const result = new Map<string, VariableInfo>();
	for (const argument of argumentsDefinition.arguments) {
		const argName = argument.name.value;
		const argType = getArgumentType(argument.value);
		if (argType != null) {
			result.set(argName, argType);
		}
	}
	return result;
}

function getOperationVariables(
	operationNode: OperationDefinitionNode,
): Map<string, VariableInfo> | null {
	if (operationNode.variableDefinitions == null || operationNode.variableDefinitions.length === 0) {
		return null;
	}

	const result = new Map<string, VariableInfo>();
	for (const variableDef of operationNode.variableDefinitions) {
		const varName = variableDef.variable.name.value;
		const varType = variableDef.type;
		const hasDefaultValue = variableDef.defaultValue != null;
		result.set(varName, {
			hasDefaultValue: hasDefaultValue,
			typeNode: varType,
		});
	}
	return result;
}

function assertNever(val: never, msg: string): never {
	throw new Error(msg);
}

function printGraphQLListType(
	listType: ListTypeNode,
	typesToImport: Set<string>,
	isNonNull: boolean,
): string {
	if (isNonNull) {
		return `Array<${printGraphQLType(listType.type, typesToImport, false)}>`;
	}
	return `(Array<${printGraphQLType(listType.type, typesToImport, false)}> | null)`;
}

function getScalarType(typeName: string): string | null {
	switch (typeName) {
		case 'Int':
		case 'Float':
		case 'Probability':
		case 'ProjectTaskProgress':
			return 'number';
		case 'Boolean':
			return 'boolean';
		case 'String':
		case 'ID':
		case 'DateTime':
		case 'LocalDate':
		case 'LocalDateTime':
			return 'string';
		default:
			return null;
	}
}

function printNamedGraphQLType(
	namedType: NamedTypeNode,
	typesToImport: Set<string>,
): string {
	const scalarType = getScalarType(namedType.name.value);

	if (scalarType != null) {
		return scalarType;
	}

	typesToImport.add(namedType.name.value);

	return namedType.name.value;
}

function printGraphQLType(
	typeNode: TypeNode,
	typesToImport: Set<string>,
	isNonNull: boolean = false,
): string {
	switch (typeNode.kind) {
		case 'NamedType': {
			const namedType = printNamedGraphQLType(typeNode, typesToImport);
			if (isNonNull) {
				return namedType;
			}
			return namedType + ' | null';
		}
		case 'NonNullType':
			return printGraphQLType(typeNode.type, typesToImport, true);
		case 'ListType':
			return printGraphQLListType(typeNode, typesToImport, isNonNull);
		default:
			return assertNever(typeNode, 'Unexpected type');
	}
}

function getOperationInputType(
	variablesInfo: Map<string, VariableInfo> | null,
	operationName: string,
	typesToImport: Set<string>,
): string {
	if (variablesInfo == null) {
		return '';
	}

	const typeLines: string[] = [];
	variablesInfo.forEach((varInfo, varName) => {
		const optionalParamDef = varInfo.hasDefaultValue || varInfo.typeNode.kind !== 'NonNullType' ? '?' : '';
		typeLines.push(`  ${varName}${optionalParamDef}: ${printGraphQLType(varInfo.typeNode, typesToImport, false)},\n`);
	});

	return `export interface ${operationName}Variables {\n${typeLines.join('')}}\n`;
}

function stripExportTypeDirectives<TNode extends ASTNode>(
	graphQLNode: TNode,
): TNode {
	return visit(graphQLNode, {
		Directive(directiveNode: DirectiveNode) {
			if (directiveNode.name.value === 'exportType') {
				return null;
			}
		},
	});
}

export async function generator(
	schema: GraphQLSchema,
	baseDefinitions: DocumentNode[],
	documents: DocumentNode[],
): Promise<Map<string, string>> {
	const map = new Map<string, string>();

	const fragmentDefinitions = new Map<string, FragmentDefinitionNode>();
	const operationDefinitions = [];

	const fragmentVariables = new Map<string, Map<string, VariableInfo>>();
	const containerFragments = new Map<string, Set<string>>();

	const addContainerFragment = (containerName: string, fragmentName: string) => {
		let fragments = containerFragments.get(containerName);

		if (fragments == null) {
			fragments = new Set<string>();
			containerFragments.set(containerName, fragments);
		}
		fragments.add(fragmentName);
	};

	const getFragmentVariables = (
		variableInfo: Map<string, VariableInfo> | null,
		fragmentName: string,
		typesToImport: Set<string>,
	): string => {
		if (variableInfo == null) {
			return '';
		}

		const typeLines: string[] = [];
		variableInfo.forEach((info, name) => {
			typeLines.push(`  ${name}: ${printGraphQLType(info.typeNode, typesToImport, info.hasDefaultValue)},\n`);
		});

		return `export type ${fragmentName}_variables = {\n${typeLines.join('')}};\n`;
	};

	for (const document of documents) {
		for (const definition of document.definitions) {
			if (definition.kind === 'FragmentDefinition') {
				const name = definition.name.value;
				const ast = getNormalizedAst(schema, {
					definitions: [definition],
					kind: 'Document',
				});

				const typeDefinitions = getNamedTypeBrandedTypeDefinitions(ast);

				const typesToImport = new Set(typeDefinitions.brandsToImport);
				const variableDefinitions = getVariableDefinitions(definition);
				const fragmentVariablesCode = getFragmentVariables(variableDefinitions, name, typesToImport);
				const parts: string[] = [
					'// tslint:disable\nimport { ' + Array.from(typesToImport.values()).join(', ') + ' } from \'graphql-schema\';\n\n',
					'export type ' + name + ' = ' + typeDefinitions.fragmentTypeText + ';\n\n',
					'export type ' + name + '_brand = ' + typeDefinitions.fragmentTypeBrandText + ';\n' +
					fragmentVariablesCode + '\n',
					typeDefinitions.exportNamesTypeScriptCode,
				];

				map.set(name, parts.join(''));
				fragmentDefinitions.set(name, stripExportTypeDirectives(definition));
				const containerName = getFragmentNameParts(definition.name.value)[0];
				if (variableDefinitions != null) {
					fragmentVariables.set(name, variableDefinitions);
				}
				addContainerFragment(containerName, name);
			} else if (definition.kind === 'OperationDefinition') {
				operationDefinitions.push(definition);
			}
		}
	}
	const allFragmentDefinitionsNeededForFragment = new Map<string, Set<FragmentDefinitionNode>>();

	fragmentDefinitions.forEach((fragmentDefinition, name) => {
		const referencedFragmentNames = findReferencedFragmentNames(fragmentDefinition, fragmentDefinitions);

		const neededDfinitions = new Set<FragmentDefinitionNode>([fragmentDefinition]);
		referencedFragmentNames.forEach((fragmentName) => {
			neededDfinitions.add(fragmentDefinitions.get(fragmentName) as FragmentDefinitionNode);
		});
		allFragmentDefinitionsNeededForFragment.set(fragmentDefinition.name.value, neededDfinitions);
	});

	for (const operationDefinition of operationDefinitions) {
		const operationName = operationDefinition.name;
		if (operationName == null) {
			throw new Error('Unnamed operations are not supported.');
		}

		const neededFragments = new Set<FragmentDefinitionNode>();
		const visitedNames = new Set<string>();
		visit(operationDefinition, {
			FragmentSpread: (fragmentSpread: FragmentSpreadNode) => {
				if (visitedNames.has(fragmentSpread.name.value)) {
					return;
				}
				visitedNames.add(fragmentSpread.name.value);
				const fragments = allFragmentDefinitionsNeededForFragment.get(fragmentSpread.name.value);
				if (fragments == null) {
					throw new Error('Could not find fragment.');
				}
				fragments.forEach(fd => neededFragments.add(fd));
			},
		});

		const document: DocumentNode = {
			definitions: [operationDefinition, ...Array.from(neededFragments.values())],
			kind: 'Document',
		};

		const operationAst = getNormalizedOperationAst(schema, document, operationDefinition);
		const typeDefinitions = getNamedTypeBrandedTypeDefinitions(operationAst);

		const inputVariables = getOperationVariables(operationDefinition);
		const name = operationName.value;

		const typesToImport = new Set(typeDefinitions.brandsToImport);
		const operationInputVariablesType = getOperationInputType(inputVariables, operationName.value, typesToImport);
		const parts: string[] = [
			'// tslint:disable\nimport { ' + Array.from(typesToImport.values()).join(', ') + ' } from \'graphql-schema\';\n\n',
			'export type ' + name + ' = ' + typeDefinitions.fragmentTypeText + ';\n',
			operationInputVariablesType + '\n',
			typeDefinitions.exportNamesTypeScriptCode,
		];

		map.set(name, parts.join(''));
	}

	await writeRelayGeneratedFile(
		schema,
		operationDefinitions,
		Array.from(fragmentDefinitions.keys()),
		(fragmentName: string): boolean => fragmentVariables.has(fragmentName),
	);
	return map;
}

function sortBy<TEl, TCmp extends string | number | boolean>(
	arr: TEl[],
	cmp: (a: TEl) => TCmp,
): TEl[] {
	return arr.sort((a, b) => {
		const aCmp = cmp(a);
		const bCmp = cmp(b);

		if (aCmp < bCmp) {
			return -1;
		} else if (bCmp < aCmp) {
			return 1;
		}
		return 0;
	});
}

function groupBy<TEl, TGroupSelector extends string | number | boolean>(
	arr: TEl[],
	groupSelector: (a: TEl) => TGroupSelector,
	elSort?: (el: TEl) => string | number | boolean,
): {
	elements: TEl[];
	key: TGroupSelector;
}[] {
	const res = new Map<TGroupSelector, TEl[]>();
	for (const el of arr) {
		const group = groupSelector(el);
		let groupRes = res.get(group);
		if (groupRes == null) {
			groupRes = [];
			res.set(group, groupRes);
		}
		groupRes.push(el);
	}
	return Array.from(res.entries()).map(([group, els]) => ({
		elements: elSort != null ? sortBy(els, elSort) : els,
		key: group,
	}));
}

const destFile = path.resolve(__dirname, '..', 'includes', 'relay.d.ts');
const schemaFile = path.resolve(__dirname, '..', 'types', 'graphql-schema.ts');
async function writeRelayGeneratedFile(
	schema: GraphQLSchema,
	operationDefinitions: OperationDefinitionNode[],
	fragmentDefinitions: string[],
	fragmentHasVariables: (fragmentName: string) => boolean,
): Promise<void> {
	const imports: string[] = [];
	const operationDecls: string[] = [];
	const containerDecls: string[] = [];

	sortBy(operationDefinitions, (n) => (n.name as NameNode).value).forEach(operationNode => {
		const name = (operationNode.name as NameNode).value;

		const hasVariables = operationNode.variableDefinitions != null && operationNode.variableDefinitions.length > 0;

		if (hasVariables) {
			imports.push(`import { ${name} as ${name}Payload, ${name}Variables } from 'generated/${name}.graphql';`);
			operationDecls.push(
				`    export interface ${name} {\n      query: ${name}Payload;\n      variables: ${name}Variables;\n    }`,
			);
		} else {
			imports.push(`import { ${name} as ${name}Payload } from 'generated/${name}.graphql';`);
			operationDecls.push(
				`    export interface ${name} {\n      query: ${name}Payload;\n      variables: {};\n    }`,
			);
		}
	});

	const containers = groupBy(fragmentDefinitions, v => getFragmentNameParts(v)[0], v => v);

	containers.forEach(containerInfo => {
		const containerName = containerInfo.key;
		const properties: string[] = [];
		const propertiesBrand: string[] = [];
		const variableTypes: string[] = [];
		containerInfo.elements.forEach((fragmentName) => {
			const hasVariables = fragmentHasVariables(fragmentName);
			const propertyName = getFragmentNameParts(fragmentName)[1];
			properties.push(`{ ${propertyName}: ${fragmentName} }`);
			propertiesBrand.push(`{ ${propertyName}: ${fragmentName}_brand }`);
			if (hasVariables) {
				variableTypes.push(fragmentName + '_variables');
				imports.push(
					`import { ${fragmentName}, ${fragmentName}_brand, ${fragmentName}_variables } ` +
					`from 'generated/${fragmentName}.graphql';`,
				);
			} else {
				imports.push(
					`import { ${fragmentName}, ${fragmentName}_brand } from 'generated/${fragmentName}.graphql';`,
				);
			}
		});

		let variablesGenericArg = '';
		if (variableTypes.length > 0) {
			containerDecls.push(
				`    export type ${containerName}Variables = ${variableTypes.join(' & ')};`,
			);
			variablesGenericArg = `, ${containerName}Variables`;
		}

		// Fragment container
		containerDecls.push(
			`    export type ${containerName}FragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<` +
			properties.join(' & '),
			`, Props>`,
		);
		containerDecls.push(
			`    export abstract class ${containerName}FragmentContainer<Props = {}, State = {}> ` +
			`extends ReactRelay.FragmentContainer<${properties.join(' & ')}, ${propertiesBrand.join(' & ')}, Props, State> { }`,
		);

		// Refetch container
		containerDecls.push(
			`    export type ${containerName}RefetchContainerProps` +
			`<Props, RefetchQuery extends ReactRelay.BaseQuery>` +
			` = ReactRelay.RefetchContainerProps<` +
			properties.join(' & '),
			`, Props, RefetchQuery${variablesGenericArg}>`,
		);
		containerDecls.push(
			`    export abstract class ${containerName}RefetchContainer` +
			`<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer` +
			`<${properties.join(' & ')}, ${propertiesBrand.join(' & ')}, Props, State, RefetchQuery${variablesGenericArg}> { }`,
		);

		// Pagination container
		containerDecls.push(
			`    export type ${containerName}PaginationContainerProps` +
			`<Props, PaginationQuery extends ReactRelay.BaseQuery>` +
			` = ReactRelay.PaginationContainerProps<` +
			properties.join(' & '),
			`, Props, PaginationQuery${variablesGenericArg}>`,
		);

		containerDecls.push(
			`    export abstract class ${containerName}PaginationContainer` +
			`<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer` +
			`<${properties.join(' & ')}, ${propertiesBrand.join(' & ')}, ` +
			`Props, State, PaginationQuery${variablesGenericArg}> { }`,
		);
	});

	const content = [
		`import * as ReactRelay from 'react-relay/definitions';`,
		`${imports.join('\n')}\n\ndeclare global {\n  namespace Relay {`,
		...operationDecls,
		'',
		...containerDecls,
		'  }',
		'}',
		'',
	];

	await writeFile(destFile, content.join('\n'));
	await writeFile(schemaFile, generateSchemaFile(schema));
}

async function writeFile(
	filePath: string,
	contents: string,
): Promise<void> {
	if (!await fs.exists(filePath)) {
		return fs.writeFile(filePath, contents, 'utf8');
	}

	const existingContents: string = await fs.readFile(filePath, 'utf8');

	if (existingContents !== contents) {
		return fs.writeFile(filePath, contents);
	}
}
