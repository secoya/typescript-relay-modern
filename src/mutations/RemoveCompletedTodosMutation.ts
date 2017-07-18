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
import { ConnectionHandler, Environment, RecordSourceSelectorProxy } from 'relay-runtime';

const mutation = graphql`
  mutation RemoveCompletedTodosMutation($input: RemoveCompletedTodosInput!) {
    removeCompletedTodos(input: $input) {
      deletedTodoIds,
      viewer {
        completedCount,
        totalCount,
      },
    }
  }
`;

function sharedUpdater(store: RecordSourceSelectorProxy, user: UserInfo, deletedIDs: string[]) {
	const userProxy = store.get(user.id);
	if (userProxy == null) {
		throw new Error('Could not get user proxy for id: ' + user.id);
	}
	const conn = ConnectionHandler.getConnection(
		userProxy,
		'TodoList_todos',
	);
	if (conn == null) {
		throw new Error('Could not get connection TodoList_todos for user: ' + user.id);
	}
	deletedIDs.forEach((deletedID) =>
		ConnectionHandler.deleteNode(conn, deletedID),
	);
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
	todos: TodoConnection,
	user: UserInfo,
) {
	return commitMutation<Relay.RemoveCompletedTodosMutation>(
		environment,
		{
			mutation,
			optimisticUpdater: (store) => {
				if (todos && todos.edges) {
					const deletedIDs: string[] = [];
					todos.edges.forEach(edge => {
						if (edge != null && edge.node != null && edge.node.complete) {
							deletedIDs.push(edge.node.id);
						}
					});
					sharedUpdater(store, user, deletedIDs);
				}
			},
			updater: (store) => {
				const payload = store.getRootField('removeCompletedTodos');
				if (payload == null) {
					throw new Error('Could not find root field in payload: removeCompletedTodos');
				}
				sharedUpdater(store, user, payload.getValue('deletedTodoIds'));
			},
			variables: {
				input: {},
			},
		},
	);
}

export default { commit };
