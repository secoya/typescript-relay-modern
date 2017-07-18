/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
	GraphQLBoolean,
	GraphQLFieldConfigArgumentMap,
	GraphQLFieldConfigMap,
	GraphQLInt,
	GraphQLID,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';

import {
	connectionArgs,
	connectionDefinitions,
	connectionFromArray,
	cursorForObjectInConnection,
	fromGlobalId,
	globalIdField,
	mutationWithClientMutationId,
	nodeDefinitions,
	toGlobalId,
	GraphQLNodeDefinitions,
} from 'graphql-relay';

import {
	addTodo,
	changeTodoStatus,
	getTodo,
	getTodos,
	getUser,
	getViewer,
	markAllTodos,
	removeCompletedTodos,
	removeTodo,
	renameTodo,
	Todo,
	User,
} from './database';

const def: GraphQLNodeDefinitions = nodeDefinitions(
	(globalId) => {
		const { type, id } = fromGlobalId(globalId);
		if (type === 'Todo') {
			return getTodo(id);
		} else if (type === 'User') {
			return getUser(id);
		}
		return null;
	},
	(obj: any) => {
		if (obj instanceof Todo) {
			return GraphQLTodo;
		} else if (obj instanceof User) {
			return GraphQLUser;
		}
		return null as any;
	},
);

const { nodeInterface, nodeField } = def;

const GraphQLTodo = new GraphQLObjectType({
	fields: {
		complete: {
			resolve: (obj) => obj.complete,
			type: GraphQLBoolean,
		},
		id: globalIdField('Todo'),
		text: {
			resolve: (obj) => obj.text,
			type: GraphQLString,
		},
	},
	interfaces: [nodeInterface],
	name: 'Todo',
});

const {
	connectionType: TodosConnection,
	edgeType: GraphQLTodoEdge,
} = connectionDefinitions({
		name: 'Todo',
		nodeType: GraphQLTodo,
	});

const GraphQLUser = new GraphQLObjectType({
	fields: {
		completedCount: {
			resolve: () => getTodos('completed').length,
			type: new GraphQLNonNull(GraphQLInt),
		},
		id: globalIdField('User'),
		todos: {
			args: {
				status: {
					defaultValue: 'any',
					type: GraphQLString,
				},
				...(connectionArgs as GraphQLFieldConfigArgumentMap),
			} as GraphQLFieldConfigArgumentMap,
			resolve: (obj, { status, ...args }) =>
				connectionFromArray(getTodos(status), args),
			type: new GraphQLNonNull(TodosConnection),
		},
		totalCount: {
			resolve: () => getTodos().length,
			type: new GraphQLNonNull(GraphQLInt),
		},
	} as GraphQLFieldConfigMap<any, any>,
	interfaces: [nodeInterface],
	name: 'User',
});

const Query = new GraphQLObjectType({
	fields: {
		node: nodeField,
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
	name: 'Query',
});

const GraphQLAddTodoMutation = mutationWithClientMutationId({
	inputFields: {
		text: { type: new GraphQLNonNull(GraphQLString) },
	},
	mutateAndGetPayload: ({ text }) => {
		const localTodoId = addTodo(text, false);
		return { localTodoId };
	},
	name: 'AddTodo',
	outputFields: {
		todoEdge: {
			resolve: ({ localTodoId }) => {
				const todo = getTodo(localTodoId);
				return {
					cursor: cursorForObjectInConnection(getTodos(), todo),
					node: todo,
				};
			},
			type: GraphQLTodoEdge,
		},
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
});

const GraphQLChangeTodoStatusMutation = mutationWithClientMutationId({
	inputFields: {
		complete: { type: new GraphQLNonNull(GraphQLBoolean) },
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	mutateAndGetPayload: ({ id, complete }) => {
		const localTodoId = fromGlobalId(id).id;
		changeTodoStatus(localTodoId, complete);
		return { localTodoId };
	},
	name: 'ChangeTodoStatus',
	outputFields: {
		todo: {
			resolve: ({ localTodoId }) => getTodo(localTodoId),
			type: GraphQLTodo,
		},
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
});

const GraphQLMarkAllTodosMutation = mutationWithClientMutationId({
	inputFields: {
		complete: { type: new GraphQLNonNull(GraphQLBoolean) },
	},
	mutateAndGetPayload: ({ complete }) => {
		const changedTodoLocalIds = markAllTodos(complete);
		return { changedTodoLocalIds };
	},
	name: 'MarkAllTodos',
	outputFields: {
		changedTodos: {
			resolve: ({ changedTodoLocalIds }) => changedTodoLocalIds.map(getTodo),
			type: new GraphQLList(GraphQLTodo),
		},
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
});

// TODO: Support plural deletes
const GraphQLRemoveCompletedTodosMutation = mutationWithClientMutationId({
	inputFields: {},
	mutateAndGetPayload: () => {
		const deletedTodoLocalIds = removeCompletedTodos();
		const deletedTodoIds = deletedTodoLocalIds.map(toGlobalId.bind(null, 'Todo'));
		return { deletedTodoIds };
	},
	name: 'RemoveCompletedTodos',
	outputFields: {
		deletedTodoIds: {
			resolve: ({ deletedTodoIds }) => deletedTodoIds,
			type: new GraphQLList(GraphQLString),
		},
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
});

const GraphQLRemoveTodoMutation = mutationWithClientMutationId({
	inputFields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	mutateAndGetPayload: ({ id }) => {
		const localTodoId = fromGlobalId(id).id;
		removeTodo(localTodoId);
		return { id };
	},
	name: 'RemoveTodo',
	outputFields: {
		deletedTodoId: {
			resolve: ({ id }) => id,
			type: GraphQLID,
		},
		viewer: {
			resolve: () => getViewer(),
			type: GraphQLUser,
		},
	},
});

const GraphQLRenameTodoMutation = mutationWithClientMutationId({
	inputFields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		text: { type: new GraphQLNonNull(GraphQLString) },
	},
	mutateAndGetPayload: ({ id, text }) => {
		const localTodoId = fromGlobalId(id).id;
		renameTodo(localTodoId, text);
		return { localTodoId };
	},
	name: 'RenameTodo',
	outputFields: {
		todo: {
			resolve: ({ localTodoId }) => getTodo(localTodoId),
			type: GraphQLTodo,
		},
	},
});

const Mutation = new GraphQLObjectType({
	fields: {
		addTodo: GraphQLAddTodoMutation,
		changeTodoStatus: GraphQLChangeTodoStatusMutation,
		markAllTodos: GraphQLMarkAllTodosMutation,
		removeCompletedTodos: GraphQLRemoveCompletedTodosMutation,
		removeTodo: GraphQLRemoveTodoMutation,
		renameTodo: GraphQLRenameTodoMutation,
	},
	name: 'Mutation',
});

export const schema = new GraphQLSchema({
	mutation: Mutation,
	query: Query,
});
