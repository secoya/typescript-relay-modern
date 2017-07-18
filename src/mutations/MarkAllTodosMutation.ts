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
	commitMutation,
	graphql,
} from 'react-relay';
import { Environment } from 'relay-runtime';

const mutation = graphql`
mutation MarkAllTodosMutation($input: MarkAllTodosInput!) {
	markAllTodos(input: $input) {
		changedTodos {
			id
			complete
		}
		viewer {
			id
			completedCount
		}
	}
}
`;

function getOptimisticResponse(complete: boolean, todos: TodoConnection, user: UserInfo) {
	const payload: {
		changedTodos?: {
			complete: boolean;
			id: string;
		}[];
		viewer: {
			completedCount?: number;
			id: string;
		};
	} = {
			viewer: { id: user.id },
		};
	if (todos && todos.edges) {
		payload.changedTodos = [];
		const changedTodos = payload.changedTodos;
		todos.edges.forEach(edge => {
			if (edge != null && edge.node != null && edge.node.complete !== complete) {
				changedTodos.push({
					complete: complete,
					id: edge.node.id,
				});
			}
		});
	}
	if (user.totalCount != null) {
		payload.viewer.completedCount = complete ?
			user.totalCount :
			0;
	}
	return {
		markAllTodos: payload,
	};
}

interface TodoConnection {
	edges: (TodoEdge | null)[] | null;
}

interface TodoEdge {
	node: TodoInfo | null;
}

interface UserInfo {
	id: string;
	totalCount?: number;
}

interface TodoInfo {
	complete: boolean | null;
	id: string;
}

function commit(
	environment: Environment,
	complete: boolean,
	todos: TodoConnection,
	user: UserInfo,
) {
	return commitMutation(
		environment,
		{
			mutation,
			optimisticResponse: getOptimisticResponse(complete, todos, user),
			variables: {
				input: { complete },
			},
		},
	);
}

export default { commit };
