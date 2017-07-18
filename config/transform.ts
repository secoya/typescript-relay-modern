import { parse as parseGraphQL } from 'graphql';
import * as ts from 'typescript';
import { getFragmentNameParts } from './getFragmentNameParts';

function tsRequireFile(file: string): ts.Expression {
	return ts.createPropertyAccess(
		ts.createCall(ts.createIdentifier('require'), undefined, [
			ts.createLiteral(file),
		]),
		ts.createIdentifier('default'),
	);
}

export function transform(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
	return (sourceFile) => {

		function processNode(node: ts.Node): ts.Node {
			if (ts.isTaggedTemplateExpression(node)) {
				const tag = node.tag.getText();
				if (tag === 'graphql' || tag === 'graphql.experimental') {
					if (node.template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
						const text = (node.template as ts.NoSubstitutionTemplateLiteral).text;

						const ast = parseGraphQL(text);
						const mainDefinition = ast.definitions[0];
						if (mainDefinition.kind === 'FragmentDefinition') {
							if (!node.parent) {
								throw new Error('Expected node to have a parent');
							}
							// Only a single fragment allowed here
							if (node.parent.kind === ts.SyntaxKind.PropertyAssignment) {
								const propertyNameNode = (node.parent as ts.PropertyAssignment).name;
								if (ast.definitions.length !== 1) {
									throw new Error(
										`TypescriptTransformerRelay: Expected exactly one fragment in the ` +
										`graphql tag refeenced by the property ${propertyNameNode.getText(sourceFile)}.`,
									);
								}
								return tsRequireFile('generated/' + encodeURIComponent(mainDefinition.name.value) + '.graphql');
							}

							const nodeMap: { [name: string]: ts.Expression } = {};
							for (const definition of ast.definitions) {
								if (definition.kind !== 'FragmentDefinition') {
									throw new Error(
										`TypescriptTransformerRelay: Expected only fragments within this ` +
										`graphql tag.`,
									);
								}
								const [, propertyName] = getFragmentNameParts(definition.name.value);
								nodeMap[propertyName] = tsRequireFile(
									'generated/' +
									encodeURIComponent(definition.name.value) +
									'.graphql',
								);
							}
							return ts.createObjectLiteral(
								Object.keys(nodeMap).map(propertyName => {
									return ts.createPropertyAssignment(
										propertyName,
										nodeMap[propertyName],
									);
								}),
								true,
							);
						}

						if (mainDefinition.kind === 'OperationDefinition') {
							if (ast.definitions.length !== 1) {
								throw new Error(
									'TypescriptTransformerRelay: Expected exactly one operation ' +
									'(query, mutation, or subscription) per graphql tag.',
								);
							}
							if (mainDefinition.name == null) {
								throw new Error(
									'TypescriptTransformerRelay: Must name GraphQL Operations',
								);
							}

							return tsRequireFile('generated/' + encodeURIComponent(mainDefinition.name.value) + '.graphql');
						}

						throw new Error(
							'TypescriptTransformerRelay: Expected a fragment, mutation, query, or ' +
							'subscription, got `' +
							mainDefinition.kind +
							'`.',
						);
					}
				}
			} else if (ts.isExpressionWithTypeArguments(node)) {
				if (
					node.parent == null ||
					!ts.isHeritageClause(node.parent) ||
					node.parent.token !== ts.SyntaxKind.ExtendsKeyword
				) {
					return node;
				}

				const expr = node.expression;
				if (ts.isPropertyAccessExpression(expr)) {
					if (!ts.isIdentifier(expr.expression) || expr.expression.text !== 'Relay') {
						return node;
					}

					if (/Container$/.test(expr.name.text)) {
						return ts.createExpressionWithTypeArguments(
							node.typeArguments || [],
							ts.createPropertyAccess(ts.createIdentifier('React'), ts.createIdentifier('Component')),
						);
					}
				}
			}
			return node;
		}

		function visitNode(node: ts.Node): ts.Node {
			return ts.visitEachChild(processNode(node), childNode => visitNode(childNode), context);
		}

		return visitNode(sourceFile) as ts.SourceFile;
	};
}
